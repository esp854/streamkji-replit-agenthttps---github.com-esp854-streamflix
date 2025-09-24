@echo off
chcp 65001 >nul
echo ====================================
echo    Configuration Base de Données StreamKJI
echo ====================================
echo.

echo Vérifiez que PostgreSQL est installé et en cours d'exécution.
echo Détails d'installation par défaut :
echo - Hôte : votre_hôte_postgresql
echo - Port : votre_port_postgresql
echo - Utilisateur : votre_utilisateur
echo.

set /p DB_HOST="Entrez votre hôte PostgreSQL (ex: localhost, render.com, etc.) : "
set /p DB_PORT="Entrez votre port PostgreSQL (ex: 5432) : "
set /p DB_USER="Entrez votre utilisateur PostgreSQL : "
set /p DB_PASSWORD="Entrez votre mot de passe PostgreSQL : "
set /p DB_NAME="Entrez le nom de votre base de données : "

echo.
echo Création de la base de données...
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -c "CREATE DATABASE %DB_NAME%;"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Base de données '%DB_NAME%' créée avec succès !
    echo.
    echo Mise à jour du fichier .env...
    powershell -Command "(Get-Content '.env') -replace 'DATABASE_URL=.*', 'DATABASE_URL=postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME%' | Set-Content '.env'"
    echo.
    echo ✅ Fichier .env mis à jour !
    echo.
    echo Prochaines étapes :
    echo 1. npm run db:push     - Créer les tables
    echo 2. npm run create-admin - Créer un utilisateur admin
    echo 3. npm run dev         - Démarrer l'application
) else (
    echo ❌ Échec de la création de la base de données.
    echo Vérifiez :
    echo 1. PostgreSQL est installé et en cours d'exécution
    echo 2. Le mot de passe est correct
    echo 3. Vous avez les permissions pour créer des bases de données
)

echo.
pause