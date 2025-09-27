#!/usr/bin/env python3
"""
Skrypt do analizy struktury modułów w projekcie 1001.mask.services
Analizuje moduły, ich zależności, testy i dokumentację
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

# Kolory dla terminala
class Colors:
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    RESET = '\033[0m'

class ModuleAnalyzer:
    def __init__(self, features_dir: str = "js/features"):
        self.features_dir = Path(features_dir)
        self.modules = {}
        self.analysis_results = {
            "timestamp": datetime.now().isoformat(),
            "total_modules": 0,
            "modules": [],
            "summary": {}
        }

    def find_modules(self) -> List[Path]:
        """Znajdź wszystkie moduły (katalogi z index.js)"""
        modules = []
        if not self.features_dir.exists():
            print(f"{Colors.RED}❌ Katalog {self.features_dir} nie istnieje{Colors.RESET}")
            return modules

        for index_file in self.features_dir.rglob("index.js"):
            module_dir = index_file.parent
            modules.append(module_dir)
        
        return sorted(modules)

    def analyze_module(self, module_path: Path) -> Dict[str, Any]:
        """Analizuj pojedynczy moduł"""
        module_name = module_path.name
        version = module_path.parent.name if module_path.parent.name.startswith(('0.', '1.', 'v')) else "unknown"
        
        analysis = {
            "name": module_name,
            "version": version,
            "path": str(module_path),
            "files": {
                "index": False,
                "component": False,
                "test": False,
                "readme": False,
                "config": False
            },
            "lines_of_code": 0,
            "test_coverage": 0,
            "dependencies": [],
            "exports": [],
            "issues": []
        }

        # Sprawdź pliki
        files = list(module_path.glob("*"))
        for file_path in files:
            if file_path.name == "index.js":
                analysis["files"]["index"] = True
                analysis["lines_of_code"] += self.count_lines(file_path)
                analysis["dependencies"].extend(self.extract_dependencies(file_path))
                analysis["exports"].extend(self.extract_exports(file_path))
            
            elif file_path.name.endswith(".js") and not file_path.name.endswith(".test.js"):
                analysis["files"]["component"] = True
                analysis["lines_of_code"] += self.count_lines(file_path)
                analysis["dependencies"].extend(self.extract_dependencies(file_path))
            
            elif file_path.name.endswith(".test.js"):
                analysis["files"]["test"] = True
                analysis["test_coverage"] = self.estimate_test_coverage(file_path)
            
            elif file_path.name.upper() == "README.MD":
                analysis["files"]["readme"] = True
            
            elif file_path.name == "config.json":
                analysis["files"]["config"] = True

        # Sprawdź problemy
        if not analysis["files"]["index"]:
            analysis["issues"].append("Brak pliku index.js")
        if not analysis["files"]["test"]:
            analysis["issues"].append("Brak testów")
        if not analysis["files"]["readme"]:
            analysis["issues"].append("Brak dokumentacji README")
        if analysis["lines_of_code"] == 0:
            analysis["issues"].append("Brak kodu")

        return analysis

    def count_lines(self, file_path: Path) -> int:
        """Policz linie kodu (bez komentarzy i pustych linii)"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            code_lines = 0
            in_multiline_comment = False
            
            for line in lines:
                line = line.strip()
                
                # Pomiń puste linie
                if not line:
                    continue
                
                # Obsługa komentarzy wieloliniowych
                if '/*' in line:
                    in_multiline_comment = True
                if '*/' in line:
                    in_multiline_comment = False
                    continue
                
                if in_multiline_comment:
                    continue
                
                # Pomiń komentarze jednoliniowe
                if line.startswith('//'):
                    continue
                
                code_lines += 1
            
            return code_lines
        except Exception:
            return 0

    def extract_dependencies(self, file_path: Path) -> List[str]:
        """Wyciągnij zależności z pliku"""
        dependencies = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Znajdź importy
            import_pattern = r"import\s+.*?\s+from\s+['\"]([^'\"]+)['\"]"
            imports = re.findall(import_pattern, content)
            dependencies.extend(imports)
            
            # Znajdź require
            require_pattern = r"require\(['\"]([^'\"]+)['\"]\)"
            requires = re.findall(require_pattern, content)
            dependencies.extend(requires)
            
        except Exception:
            pass
        
        return list(set(dependencies))  # Usuń duplikaty

    def extract_exports(self, file_path: Path) -> List[str]:
        """Wyciągnij eksporty z pliku"""
        exports = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Znajdź eksporty
            export_patterns = [
                r"export\s+(?:default\s+)?(?:function\s+)?(\w+)",
                r"export\s+\{\s*([^}]+)\s*\}",
                r"module\.exports\s*=\s*(\w+)"
            ]
            
            for pattern in export_patterns:
                matches = re.findall(pattern, content)
                exports.extend(matches)
                
        except Exception:
            pass
        
        return list(set(exports))

    def estimate_test_coverage(self, test_file: Path) -> int:
        """Oszacuj pokrycie testami (uproszczone)"""
        try:
            with open(test_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Policz testy
            test_patterns = [
                r"it\s*\(",
                r"test\s*\(",
                r"describe\s*\("
            ]
            
            total_tests = 0
            for pattern in test_patterns:
                total_tests += len(re.findall(pattern, content))
            
            # Uproszczone oszacowanie - im więcej testów, tym lepsze pokrycie
            if total_tests > 20:
                return 90
            elif total_tests > 10:
                return 70
            elif total_tests > 5:
                return 50
            elif total_tests > 0:
                return 30
            else:
                return 0
                
        except Exception:
            return 0

    def generate_summary(self):
        """Wygeneruj podsumowanie analizy"""
        total_modules = len(self.analysis_results["modules"])
        modules_with_tests = sum(1 for m in self.analysis_results["modules"] if m["files"]["test"])
        modules_with_docs = sum(1 for m in self.analysis_results["modules"] if m["files"]["readme"])
        total_loc = sum(m["lines_of_code"] for m in self.analysis_results["modules"])
        avg_test_coverage = sum(m["test_coverage"] for m in self.analysis_results["modules"]) / max(total_modules, 1)
        
        self.analysis_results["summary"] = {
            "total_modules": total_modules,
            "modules_with_tests": modules_with_tests,
            "modules_with_docs": modules_with_docs,
            "test_coverage_percentage": round(modules_with_tests / max(total_modules, 1) * 100, 1),
            "documentation_percentage": round(modules_with_docs / max(total_modules, 1) * 100, 1),
            "total_lines_of_code": total_loc,
            "average_test_coverage": round(avg_test_coverage, 1),
            "modules_with_issues": sum(1 for m in self.analysis_results["modules"] if m["issues"])
        }

    def run_analysis(self):
        """Uruchom pełną analizę"""
        print(f"{Colors.BLUE}🔍 Analiza modułów w {self.features_dir}...{Colors.RESET}")
        print("=" * 50)

        modules = self.find_modules()
        if not modules:
            print(f"{Colors.YELLOW}⚠️  Nie znaleziono żadnych modułów{Colors.RESET}")
            return

        print(f"{Colors.BLUE}Znaleziono {len(modules)} modułów:{Colors.RESET}")
        
        for module_path in modules:
            analysis = self.analyze_module(module_path)
            self.analysis_results["modules"].append(analysis)
            
            # Wyświetl podstawowe info
            status_icon = "✅" if not analysis["issues"] else "⚠️"
            print(f"  {status_icon} {analysis['name']} v{analysis['version']} ({analysis['lines_of_code']} LOC)")
            
            if analysis["issues"]:
                for issue in analysis["issues"]:
                    print(f"    {Colors.YELLOW}⚠️  {issue}{Colors.RESET}")

        self.generate_summary()
        self.print_summary()
        self.save_results()

    def print_summary(self):
        """Wyświetl podsumowanie"""
        summary = self.analysis_results["summary"]
        
        print("\n" + "=" * 50)
        print(f"{Colors.BLUE}📊 PODSUMOWANIE ANALIZY{Colors.RESET}")
        print("=" * 50)
        
        print(f"Łączna liczba modułów: {summary['total_modules']}")
        print(f"Moduły z testami: {Colors.GREEN}{summary['modules_with_tests']}{Colors.RESET} ({summary['test_coverage_percentage']}%)")
        print(f"Moduły z dokumentacją: {Colors.GREEN}{summary['modules_with_docs']}{Colors.RESET} ({summary['documentation_percentage']}%)")
        print(f"Łączne linie kodu: {summary['total_lines_of_code']}")
        print(f"Średnie pokrycie testami: {summary['average_test_coverage']}%")
        print(f"Moduły z problemami: {Colors.RED}{summary['modules_with_issues']}{Colors.RESET}")

        # Rekomendacje
        print(f"\n{Colors.BLUE}💡 REKOMENDACJE:{Colors.RESET}")
        if summary['test_coverage_percentage'] < 80:
            print(f"  {Colors.YELLOW}• Dodaj testy do modułów bez testów{Colors.RESET}")
        if summary['documentation_percentage'] < 90:
            print(f"  {Colors.YELLOW}• Dodaj dokumentację README do modułów{Colors.RESET}")
        if summary['modules_with_issues'] > 0:
            print(f"  {Colors.YELLOW}• Napraw problemy w modułach{Colors.RESET}")

    def save_results(self):
        """Zapisz wyniki do pliku JSON"""
        output_file = "module-analysis-results.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.analysis_results, f, indent=2, ensure_ascii=False)
        
        print(f"\n{Colors.BLUE}📄 Szczegółowe wyniki zapisane w: {output_file}{Colors.RESET}")

def main():
    analyzer = ModuleAnalyzer()
    analyzer.run_analysis()

if __name__ == "__main__":
    main()
