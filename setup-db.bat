@echo off
chcp 65001 >nul
echo ====================================
echo    Configuration Base de Données StreamKJI
echo ====================================
echo.

echo Vérifiez que PostgreSQL est installé et en cours d'exécution.
echo Détails d'installation par défaut :
echo - Hôte : localhost
echo - Port : 5432
echo - Utilisateur : postgres
echo.

set /p DB_PASSWORD="Entrez votre mot de passe PostgreSQL : "

echo.
echo Création de la base de données...
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE streamkji;"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Base de données 'streamkji' créée avec succès !
    echo.
    echo Mise à jour du fichier .env...
    powershell -Command "(Get-Content '.env') -replace 'DATABASE_URL=postgresql://postgres:.*@localhost:5432/streamkji', 'DATABASE_URL=postgresql://postgres:%DB_PASSWORD%@localhost:5432/streamkji' | Set-Content '.env'"
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