- specyfikacja generowania

- makefile dla wszystkich procesow
- scripts/*.sh  scripts/*.py dla skryptow uzywanych z makefile
- testowanie poszczegolnych modulow jeden po drugim


## migracja
przenieś kolejne moduły z /home/tom/github/zlecenia/c201001.mask.services/js/components
do /home/tom/github/zlecenia/1001.mask.services/js/features uwzględniając wskazówki migracji z pliku /home/tom/github/zlecenia/1001.mask.services/components.md


jak uruchamiać osobno każdy moduł w przeglądarce jako usługa?
stworz dodatkowoe pliki jesli to koneiczne i dodaj scripts w package.json oraz zaktualizuj dokumetnacje README.md w każdym module, aby możliwe było po wejściu do folderu feature, np  /home/tom/github/zlecenia/1001.mask.services/js/features/appFooter/0.1.0/   uruchomienie danego rozszerzenia wprzegladarce w celu przetetsowania

## naprawa
uwzględniając wskazówki migracji z pliku components.md popraw strukture plikow components w js/features/*/*


## selektywne uruchamianie
zaktulaizuj dokumentacje odnosnie uruchamiania selektywnie każdego modułu jako kompletnego poprzez wywołania ze scripts w package.json, tak aby kazdy komponent działał niezaleznie i mozna go była nie tylko prztetsować przez unit tests ale rownież uruchomić niezaleznie

## zrzut ekranu komponentu
stworz skrypt, ktory uruchomi każdy moduł oddzielnie i będzie robił zrzuty ekranu kazdego modułu, i doda do pierwszej linijki markdown każdego modułu link do tego screenshot, ktory powinien znajdowac sie w formacie .png w danym component


## komponent edycji tree json
Stworz nowy component w js/features/*/*
wedle załaczonego pliku, to edytor kodu config.json na podstawie plikow w components  js/features/*/*/config/* odpowiednio go dopasuj, aby dzialal z kazdym innym component, ktory zawiera pliki w folderze config/

Jak to uruchomic, aby np komponent edytora json, byl zaladowany jako pierwszy w celu edycji danych js/features/*/*/config/config.json innego komponentu, stworz przyklad uzycia

## migracja komponentów
usun wszystkie Mock pageTemplate content for Service Technician i wstaw docelowe rpodukcyjne wersje na bazie aktualnych komponentow w js/feature/*/*
jeśli brakuje implementacji konkretnego komponentu to znajdz wczesniejsza wersje tutaj: /home/tom/github/zlecenia/c201001.mask.services/js
