$action = New-ScheduledTaskAction -Execute "wsl.exe" -Argument "-d Ubuntu -- bash -lc '/mnt/c/Users/ookot/east-lake/east-lake-app/scripts/refresh-rentals.sh'"
$trigger = New-ScheduledTaskTrigger -Daily -At "6:00AM"
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
Register-ScheduledTask -TaskName "EastLake-RentalRefresh" -Action $action -Trigger $trigger -Settings $settings -Description "Fetch and push Zillow rental listings for East Lake housing search" -Force
Get-ScheduledTask -TaskName "EastLake-RentalRefresh" | Format-List TaskName, State
