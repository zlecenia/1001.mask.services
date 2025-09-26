# MASKSERVICE C20 1001 - Python Backend Specification

## Overview

This document provides a comprehensive specification for the Python backend of the MASKSERVICE industrial monitoring system, designed to support the Vue 3 frontend with real-time sensor monitoring, role-based access control, and WebSocket communication for 7.9" LCD displays.

## System Architecture

### Core Principles
- **Microservices Architecture**: Modular backend services with clear separation of concerns
- **Real-Time Communication**: WebSocket-based live data streaming
- **Role-Based Security**: Four-tier authentication system matching frontend roles
- **Industrial Reliability**: 99.9% uptime requirements with failover mechanisms
- **API-First Design**: RESTful APIs with OpenAPI 3.0 documentation
- **Container-Ready**: Docker containerization for production deployment

### Technology Stack
- **Framework**: FastAPI 0.104+ with async/await
- **Database**: PostgreSQL 15+ with SQLAlchemy 2.0
- **Caching**: Redis 7+ for session storage and real-time data
- **WebSocket**: FastAPI WebSocket with connection pooling
- **Authentication**: JWT tokens with refresh mechanism
- **Testing**: Pytest with async test support
- **Deployment**: Docker + Docker Compose
- **Monitoring**: Prometheus + Grafana metrics

## Backend Services Architecture

### 1. Authentication Service (`auth_service.py`)

**Purpose**: Handles user authentication, role management, and session control

#### Core Features
```python
class AuthService:
    async def authenticate_user(username: str, password: str, role: str) -> TokenResponse
    async def validate_token(token: str) -> UserContext
    async def refresh_token(refresh_token: str) -> TokenResponse
    async def logout_user(token: str) -> bool
    async def check_permissions(user: UserContext, permission: str) -> bool
```

#### Role-Based Access Control (RBAC)
```python
ROLE_PERMISSIONS = {
    "OPERATOR": {
        "permissions": ["view_sensors", "view_alerts"],
        "endpoints": ["/api/sensors", "/api/alerts"],
        "color": "#27ae60",
        "session_timeout": 1800  # 30 minutes
    },
    "ADMIN": {
        "permissions": ["manage_tests", "manage_reports", "manage_users"],
        "endpoints": ["/api/tests", "/api/reports", "/api/users"],
        "color": "#f39c12",
        "session_timeout": 3600  # 60 minutes
    },
    "SUPERUSER": {
        "permissions": ["full_system_access", "config_edit"],
        "endpoints": ["*"],
        "color": "#e74c3c",
        "session_timeout": 7200  # 120 minutes
    },
    "SERWISANT": {
        "permissions": ["service_mode", "calibration", "diagnostics"],
        "endpoints": ["/api/service", "/api/calibration", "/api/diagnostics"],
        "color": "#3498db",
        "session_timeout": 14400  # 240 minutes
    }
}
```

#### Security Features
- **Password Hashing**: bcrypt with salt rounds 12
- **Brute Force Protection**: 3 attempts, 5-minute lockout
- **JWT Security**: RS256 algorithm, 15-minute access tokens
- **Session Management**: Redis-based with automatic cleanup
- **CSRF Protection**: SameSite cookies with CSRF tokens

### 2. Sensor Data Service (`sensor_service.py`)

**Purpose**: Real-time sensor data collection, processing, and WebSocket streaming

#### Pressure Sensor Configuration
```python
class PressureSensorConfig:
    P1_CONFIG = {
        "name": "Pressure 1",
        "range": {"min": 0, "max": 10, "unit": "bar"},
        "thresholds": {
            "normal": {"min": 2, "max": 8},
            "warning": {"min": 1.5, "max": 9},
            "critical": {"min": 0, "max": 1.5}
        },
        "update_interval": 1.0,  # seconds
        "retention_period": 3600  # 1 hour
    }
    
    P2_CONFIG = {
        "name": "Pressure 2", 
        "range": {"min": 0, "max": 5, "unit": "bar"},
        "thresholds": {
            "normal": {"min": 1, "max": 4},
            "warning": {"min": 0.5, "max": 4.5},
            "critical": {"min": 0, "max": 0.5}
        }
    }
    
    P3_CONFIG = {
        "name": "Pressure 3",
        "range": {"min": 0, "max": 1000, "unit": "mbar"},
        "thresholds": {
            "normal": {"min": 200, "max": 800},
            "warning": {"min": 100, "max": 900},
            "critical": {"min": 0, "max": 100}
        }
    }
```

#### WebSocket Implementation
```python
class SensorWebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.sensor_data_cache = {}
    
    async def connect(self, websocket: WebSocket, user_role: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        await self.send_initial_data(websocket, user_role)
    
    async def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast_sensor_data(self, sensor_data: dict):
        for connection in self.active_connections:
            await connection.send_json(sensor_data)
    
    async def collect_and_broadcast(self):
        while True:
            data = await self.collect_sensor_data()
            await self.broadcast_sensor_data(data)
            await asyncio.sleep(1.0)
```

### 3. Device Management Service (`device_service.py`)

**Purpose**: Device status monitoring, configuration, and communication

#### Device Status Management
```python
class DeviceStatus:
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE" 
    CONNECTING = "CONNECTING"
    ERROR = "ERROR"

class DeviceService:
    async def get_device_status(self) -> dict:
        return {
            "status": DeviceStatus.ONLINE,
            "device_id": "C15.25.1010",
            "last_heartbeat": datetime.utcnow(),
            "network_latency": 15,  # ms
            "data_quality": 0.98,
            "uptime": 86400,  # seconds
            "memory_usage": 0.65
        }
    
    async def ping_device(self) -> bool:
        # Hardware communication logic
        pass
    
    async def update_device_config(self, config: dict) -> bool:
        # Configuration update logic
        pass
```

### 4. API Routes (`api/routes/`)

#### Authentication Routes (`auth.py`)
```python
@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    user = await auth_service.authenticate_user(
        credentials.username, 
        credentials.password, 
        credentials.role
    )
    if user:
        tokens = await auth_service.generate_tokens(user)
        return TokenResponse(**tokens)
    raise HTTPException(401, "Invalid credentials")

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(token: RefreshTokenRequest):
    return await auth_service.refresh_token(token.refresh_token)

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    await auth_service.logout_user(current_user.token)
    return {"message": "Logged out successfully"}
```

#### Sensor Data Routes (`sensors.py`)
```python
@router.get("/sensors", response_model=List[SensorData])
async def get_sensor_data(
    current_user: User = Depends(get_current_user),
    limit: int = 100
):
    check_permission(current_user, "view_sensors")
    return await sensor_service.get_recent_data(limit)

@router.get("/sensors/{sensor_id}/history")
async def get_sensor_history(
    sensor_id: str,
    start_time: datetime,
    end_time: datetime,
    current_user: User = Depends(get_current_user)
):
    check_permission(current_user, "view_sensors")
    return await sensor_service.get_historical_data(
        sensor_id, start_time, end_time
    )

@router.websocket("/ws/sensors")
async def websocket_sensors(
    websocket: WebSocket,
    token: str = Query(...),
):
    user = await auth_service.validate_token(token)
    if not user:
        await websocket.close(code=4001)
        return
    
    await websocket_manager.connect(websocket, user.role)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
```

## Database Models

### User Management
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime)

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(String(36), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
```

### Sensor Data Models
```python
class SensorReading(Base):
    __tablename__ = "sensor_readings"
    
    id = Column(Integer, primary_key=True)
    sensor_id = Column(String(10), nullable=False)  # P1, P2, P3
    value = Column(Float, nullable=False)
    unit = Column(String(10), nullable=False)
    status = Column(Enum(SensorStatus), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    device_id = Column(String(20), nullable=False)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True)
    sensor_id = Column(String(10), nullable=False)
    alert_type = Column(Enum(AlertType), nullable=False)  # WARNING, CRITICAL
    message = Column(Text, nullable=False)
    value = Column(Float, nullable=False)
    threshold = Column(Float, nullable=False)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
```

## Testing Strategy

### Unit Tests (`tests/unit/`)
```python
@pytest.mark.asyncio
async def test_authenticate_valid_user():
    auth_service = AuthService()
    result = await auth_service.authenticate_user(
        "operator1", "password123", "OPERATOR"
    )
    assert result.token is not None
    assert result.role == "OPERATOR"

@pytest.mark.asyncio
async def test_sensor_data_collection():
    sensor_service = SensorService()
    data = await sensor_service.collect_sensor_data()
    assert "P1" in data
    assert "P2" in data  
    assert "P3" in data
    assert all(isinstance(v["value"], float) for v in data.values())
```

### Integration Tests (`tests/integration/`)
```python
@pytest.mark.asyncio
async def test_websocket_sensor_stream():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Login and get token
        login_response = await client.post("/api/auth/login", json={
            "username": "operator1",
            "password": "password123", 
            "role": "OPERATOR"
        })
        token = login_response.json()["access_token"]
        
        # Connect to WebSocket
        async with client.websocket_connect(f"/api/ws/sensors?token={token}") as websocket:
            data = await websocket.receive_json()
            assert "P1" in data
            assert data["P1"]["value"] >= 0
```

### Performance Tests
```python
@pytest.mark.performance
async def test_concurrent_websocket_connections():
    connections = []
    for i in range(100):
        ws = await connect_websocket(f"user_{i}")
        connections.append(ws)
    
    # Simulate data broadcast
    start_time = time.time()
    await broadcast_to_all(test_data)
    end_time = time.time()
    
    assert end_time - start_time < 0.1  # < 100ms for 100 connections
```

## Deployment Configuration

### Docker Configuration (`Dockerfile`)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/maskservice
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: maskservice
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Production Configuration (`config/production.py`)
```python
class ProductionConfig:
    DATABASE_URL = os.getenv("DATABASE_URL")
    REDIS_URL = os.getenv("REDIS_URL")
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_ALGORITHM = "RS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS = 7
    
    # Security settings
    CORS_ORIGINS = ["https://1001.mask.services"]
    HTTPS_ONLY = True
    SECURE_COOKIES = True
    
    # Monitoring
    PROMETHEUS_METRICS = True
    LOG_LEVEL = "INFO"
    
    # WebSocket settings
    MAX_WEBSOCKET_CONNECTIONS = 1000
    WEBSOCKET_HEARTBEAT_INTERVAL = 30
```

## Security Implementation

### JWT Token Management
```python
class JWTManager:
    def __init__(self, private_key: str, public_key: str):
        self.private_key = private_key
        self.public_key = public_key
    
    def create_access_token(self, user_data: dict) -> str:
        payload = {
            "sub": user_data["username"],
            "role": user_data["role"],
            "permissions": user_data["permissions"],
            "exp": datetime.utcnow() + timedelta(minutes=15),
            "iat": datetime.utcnow(),
            "type": "access"
        }
        return jwt.encode(payload, self.private_key, algorithm="RS256")
    
    def verify_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, self.public_key, algorithms=["RS256"])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(401, "Invalid token")
```

### Input Validation & Sanitization
```python
class SensorDataValidator:
    @staticmethod
    def validate_pressure_reading(sensor_id: str, value: float) -> bool:
        config = SENSOR_CONFIGS.get(sensor_id)
        if not config:
            return False
        
        min_val = config["range"]["min"]
        max_val = config["range"]["max"]
        return min_val <= value <= max_val
    
    @staticmethod
    def sanitize_input(data: str) -> str:
        # Remove potential SQL injection patterns
        dangerous_patterns = ["'", '"', ";", "--", "/*", "*/"]
        for pattern in dangerous_patterns:
            data = data.replace(pattern, "")
        return data.strip()
```

## Monitoring & Logging

### Prometheus Metrics
```python
from prometheus_client import Counter, Histogram, Gauge

# Counters
login_attempts = Counter('login_attempts_total', 'Total login attempts', ['role', 'status'])
websocket_connections = Gauge('websocket_connections_active', 'Active WebSocket connections')
sensor_readings = Counter('sensor_readings_total', 'Total sensor readings', ['sensor_id'])

# Histograms
request_duration = Histogram('request_duration_seconds', 'Request duration', ['method', 'endpoint'])
websocket_message_duration = Histogram('websocket_message_duration_seconds', 'WebSocket message processing time')
```

### Structured Logging
```python
import structlog

logger = structlog.get_logger()

async def log_user_action(user: User, action: str, details: dict):
    logger.info(
        "user_action",
        user_id=user.id,
        username=user.username,
        role=user.role,
        action=action,
        details=details,
        timestamp=datetime.utcnow().isoformat()
    )
```

## API Documentation

### OpenAPI Schema Generation
```python
app = FastAPI(
    title="MASKSERVICE C20 1001 Backend API",
    description="Industrial monitoring system backend",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Auto-generated from Pydantic models and route definitions
```

### Key API Endpoints Summary

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/login` | POST | No | User authentication |
| `/api/auth/refresh` | POST | Refresh Token | Token refresh |
| `/api/sensors` | GET | Yes | Current sensor data |
| `/api/sensors/history` | GET | Yes | Historical data |
| `/api/alerts` | GET | Yes | System alerts |
| `/api/device/status` | GET | Yes | Device status |
| `/api/ws/sensors` | WebSocket | Token | Real-time data stream |

## Backup & Recovery

### Database Backup Strategy
```bash
# Daily automated backups
0 2 * * * pg_dump maskservice > /backups/maskservice_$(date +%Y%m%d).sql

# Weekly full backup with compression
0 1 * * 0 pg_dump -Fc maskservice > /backups/weekly/maskservice_$(date +%Y%m%d).dump
```

### Disaster Recovery
- **RTO (Recovery Time Objective)**: 15 minutes
- **RPO (Recovery Point Objective)**: 1 hour
- **Backup Retention**: 30 days daily, 12 weeks weekly
- **Testing**: Monthly recovery drills

## Performance Requirements

### Response Time Targets
- **API Endpoints**: < 200ms (95th percentile)
- **WebSocket Messages**: < 50ms processing time
- **Database Queries**: < 100ms
- **Authentication**: < 500ms

### Scalability Targets
- **Concurrent Users**: 100 simultaneous connections
- **WebSocket Connections**: 1000 active connections
- **Data Throughput**: 10,000 sensor readings/minute
- **Storage**: 1GB/month sensor data retention

## Conclusion

This backend specification provides a production-ready foundation for the MASKSERVICE C20 1001 system, implementing all requirements from the frontend specification with robust security, real-time capabilities, and industrial-grade reliability.

The architecture supports the exact role-based access control, sensor monitoring, and WebSocket communication patterns required by the Vue 3 frontend, ensuring seamless integration and optimal performance for 7.9" industrial displays.
