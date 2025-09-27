"""
MASKSERVICE C20 1001 Configuration SDK - Python Implementation
Universal configuration management with validation and real-time sync
"""

import json
import time
import threading
import asyncio
import aiohttp
from typing import Dict, Any, Optional, Callable, Union
from urllib.parse import urljoin
import requests
from jsonschema import validate, ValidationError


class ConfigSDK:
    """Synchronous Configuration SDK"""
    
    def __init__(self, base_url: str = "http://localhost:3000/api", headers: Dict = None, timeout: int = 30):
        self.base_url = base_url
        self.headers = {"Content-Type": "application/json"}
        if headers:
            self.headers.update(headers)
        self.timeout = timeout
        self.cache: Dict[str, Any] = {}
        self.schemas: Dict[str, dict] = {}
        self.watchers: Dict[str, threading.Thread] = {}
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def load_schema(self, name: str) -> dict:
        """Load schema for validation"""
        try:
            response = self.session.get(
                urljoin(self.base_url, f"schemas/{name}"),
                timeout=self.timeout
            )
            response.raise_for_status()
            schema = response.json()
            self.schemas[name] = schema
            return schema
        except Exception as e:
            raise Exception(f"Schema loading failed: {str(e)}")

    def validate(self, data: dict, schema_name: str) -> tuple[bool, list]:
        """Validate data against schema"""
        schema = self.schemas.get(schema_name)
        if not schema:
            raise ValueError(f"Schema {schema_name} not loaded")
        
        try:
            validate(instance=data, schema=schema)
            return True, []
        except ValidationError as e:
            return False, [str(e)]

    def get(self, config_name: str, cache: bool = False, validate_data: bool = True) -> dict:
        """Get configuration"""
        if cache and config_name in self.cache:
            return self.cache[config_name]

        try:
            response = self.session.get(
                urljoin(self.base_url, f"config/{config_name}"),
                timeout=self.timeout
            )
            response.raise_for_status()
            data = response.json()

            if validate_data and config_name in self.schemas:
                valid, errors = self.validate(data, config_name)
                if not valid:
                    raise ValidationError(f"Validation failed: {', '.join(errors)}")

            if cache:
                self.cache[config_name] = data

            return data
        except Exception as e:
            raise Exception(f"Get config failed: {str(e)}")

    def update(self, config_name: str, data: dict, validate_data: bool = True) -> dict:
        """Update entire configuration"""
        if validate_data and config_name in self.schemas:
            valid, errors = self.validate(data, config_name)
            if not valid:
                raise ValidationError(f"Validation failed: {', '.join(errors)}")

        try:
            response = self.session.put(
                urljoin(self.base_url, f"config/{config_name}"),
                json=data,
                timeout=self.timeout
            )
            response.raise_for_status()
            updated = response.json()

            if config_name in self.cache:
                self.cache[config_name] = updated

            return updated
        except Exception as e:
            raise Exception(f"Update config failed: {str(e)}")

    def patch(self, config_name: str, updates: dict, validate_data: bool = True) -> dict:
        """Partially update configuration"""
        if validate_data:
            current = self.get(config_name, cache=False)
            merged = {**current, **updates}
            
            if config_name in self.schemas:
                valid, errors = self.validate(merged, config_name)
                if not valid:
                    raise ValidationError(f"Validation failed: {', '.join(errors)}")

        try:
            response = self.session.patch(
                urljoin(self.base_url, f"config/{config_name}"),
                json=updates,
                timeout=self.timeout
            )
            response.raise_for_status()
            updated = response.json()

            if config_name in self.cache:
                self.cache[config_name] = updated

            return updated
        except Exception as e:
            raise Exception(f"Patch config failed: {str(e)}")

    def get_crud(self, config_name: str) -> dict:
        """Get CRUD rules for configuration"""
        try:
            response = self.session.get(
                urljoin(self.base_url, f"crud/{config_name}"),
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise Exception(f"Get CRUD failed: {str(e)}")

    def watch(self, config_name: str, callback: Callable, interval: float = 5.0) -> Callable:
        """Watch configuration for changes"""
        if config_name in self.watchers:
            self.watchers[config_name].stop()

        stop_event = threading.Event()
        last_data = None

        def poll():
            nonlocal last_data
            while not stop_event.is_set():
                try:
                    data = self.get(config_name, cache=False, validate_data=False)
                    data_str = json.dumps(data, sort_keys=True)
                    
                    if last_data != data_str:
                        last_data = data_str
                        callback(None, data)
                except Exception as e:
                    callback(e, None)
                stop_event.wait(interval)

        thread = threading.Thread(target=poll, daemon=True)
        thread.stop = lambda: stop_event.set()
        thread.start()
        self.watchers[config_name] = thread

        def stop():
            stop_event.set()
            if config_name in self.watchers:
                del self.watchers[config_name]

        return stop

    def clear_cache(self, config_name: Optional[str] = None):
        """Clear cache"""
        if config_name:
            self.cache.pop(config_name, None)
        else:
            self.cache.clear()

    def destroy(self):
        """Cleanup resources"""
        for watcher in self.watchers.values():
            if hasattr(watcher, 'stop'):
                watcher.stop()
        self.watchers.clear()
        self.session.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.destroy()


class AsyncConfigSDK:
    """Asynchronous Configuration SDK"""
    
    def __init__(self, base_url: str = "http://localhost:3000/api", headers: Dict = None, timeout: int = 30):
        self.base_url = base_url
        self.headers = {"Content-Type": "application/json"}
        if headers:
            self.headers.update(headers)
        self.timeout = aiohttp.ClientTimeout(total=timeout)
        self.cache: Dict[str, Any] = {}
        self.schemas: Dict[str, dict] = {}
        self.watchers: Dict[str, asyncio.Task] = {}
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers=self.headers,
            timeout=self.timeout
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.destroy()

    async def load_schema(self, name: str) -> dict:
        """Load schema for validation"""
        if not self.session:
            raise RuntimeError("SDK not initialized. Use async with.")
        
        try:
            url = urljoin(self.base_url, f"schemas/{name}")
            async with self.session.get(url) as response:
                response.raise_for_status()
                schema = await response.json()
                self.schemas[name] = schema
                return schema
        except Exception as e:
            raise Exception(f"Schema loading failed: {str(e)}")

    def validate(self, data: dict, schema_name: str) -> tuple[bool, list]:
        """Validate data against schema"""
        schema = self.schemas.get(schema_name)
        if not schema:
            raise ValueError(f"Schema {schema_name} not loaded")
        
        try:
            validate(instance=data, schema=schema)
            return True, []
        except ValidationError as e:
            return False, [str(e)]

    async def get(self, config_name: str, cache: bool = False, validate_data: bool = True) -> dict:
        """Get configuration"""
        if not self.session:
            raise RuntimeError("SDK not initialized. Use async with.")
            
        if cache and config_name in self.cache:
            return self.cache[config_name]

        try:
            url = urljoin(self.base_url, f"config/{config_name}")
            async with self.session.get(url) as response:
                response.raise_for_status()
                data = await response.json()

                if validate_data and config_name in self.schemas:
                    valid, errors = self.validate(data, config_name)
                    if not valid:
                        raise ValidationError(f"Validation failed: {', '.join(errors)}")

                if cache:
                    self.cache[config_name] = data

                return data
        except Exception as e:
            raise Exception(f"Get config failed: {str(e)}")

    async def update(self, config_name: str, data: dict, validate_data: bool = True) -> dict:
        """Update entire configuration"""
        if not self.session:
            raise RuntimeError("SDK not initialized. Use async with.")
            
        if validate_data and config_name in self.schemas:
            valid, errors = self.validate(data, config_name)
            if not valid:
                raise ValidationError(f"Validation failed: {', '.join(errors)}")

        try:
            url = urljoin(self.base_url, f"config/{config_name}")
            async with self.session.put(url, json=data) as response:
                response.raise_for_status()
                updated = await response.json()

                if config_name in self.cache:
                    self.cache[config_name] = updated

                return updated
        except Exception as e:
            raise Exception(f"Update config failed: {str(e)}")

    async def patch(self, config_name: str, updates: dict, validate_data: bool = True) -> dict:
        """Partially update configuration"""
        if validate_data:
            current = await self.get(config_name, cache=False)
            merged = {**current, **updates}
            
            if config_name in self.schemas:
                valid, errors = self.validate(merged, config_name)
                if not valid:
                    raise ValidationError(f"Validation failed: {', '.join(errors)}")

        try:
            url = urljoin(self.base_url, f"config/{config_name}")
            async with self.session.patch(url, json=updates) as response:
                response.raise_for_status()
                updated = await response.json()

                if config_name in self.cache:
                    self.cache[config_name] = updated

                return updated
        except Exception as e:
            raise Exception(f"Patch config failed: {str(e)}")

    async def get_crud(self, config_name: str) -> dict:
        """Get CRUD rules for configuration"""
        if not self.session:
            raise RuntimeError("SDK not initialized. Use async with.")
            
        try:
            url = urljoin(self.base_url, f"crud/{config_name}")
            async with self.session.get(url) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            raise Exception(f"Get CRUD failed: {str(e)}")

    async def watch(self, config_name: str, callback: Callable, interval: float = 5.0) -> Callable:
        """Watch configuration for changes"""
        if config_name in self.watchers:
            self.watchers[config_name].cancel()

        last_data = None
        stop_event = asyncio.Event()

        async def poll():
            nonlocal last_data
            while not stop_event.is_set():
                try:
                    data = await self.get(config_name, cache=False, validate_data=False)
                    data_str = json.dumps(data, sort_keys=True)
                    
                    if last_data != data_str:
                        last_data = data_str
                        if asyncio.iscoroutinefunction(callback):
                            await callback(None, data)
                        else:
                            callback(None, data)
                except Exception as e:
                    if asyncio.iscoroutinefunction(callback):
                        await callback(e, None)
                    else:
                        callback(e, None)
                
                try:
                    await asyncio.wait_for(stop_event.wait(), timeout=interval)
                    break  # Stop event was set
                except asyncio.TimeoutError:
                    continue  # Continue polling

        task = asyncio.create_task(poll())
        self.watchers[config_name] = task

        def stop():
            stop_event.set()
            if config_name in self.watchers:
                self.watchers[config_name].cancel()
                del self.watchers[config_name]

        return stop

    def clear_cache(self, config_name: Optional[str] = None):
        """Clear cache"""
        if config_name:
            self.cache.pop(config_name, None)
        else:
            self.cache.clear()

    async def destroy(self):
        """Cleanup resources"""
        for task in self.watchers.values():
            task.cancel()
        self.watchers.clear()
        
        if self.session:
            await self.session.close()
            self.session = None
