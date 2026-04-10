# Script de Agendamento Opensquad (Windows)

$NodePath = "C:\Program Files\nodejs\node.exe"
$ScriptPath = "c:\Users\jefferson.almeida.JA\.antigravity\opensquad\scripts\autonomous_runner.js"
$WorkingDir = "c:\Users\jefferson.almeida.JA\.antigravity\opensquad"

# Funcao para criar tarefa
function Create-OpensquadTask($TaskName, $Time) {
    Write-Host "Agendando tarefa: $TaskName para as $Time..."
    
    $Action = New-ScheduledTaskAction -Execute $NodePath -Argument $ScriptPath -WorkingDirectory $WorkingDir
    $Trigger = New-ScheduledTaskTrigger -Daily -At $Time
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    # Remover se ja existir para evitar erro
    schtasks /delete /tn $TaskName /f 2>$null
    
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Force
    Write-Host "Tarefa $TaskName registrada com sucesso!"
}

# Criar as duas execucoes diarias
Create-OpensquadTask -TaskName "Opensquad_Morning_Run" -Time "08:30"
Create-OpensquadTask -TaskName "Opensquad_Evening_Run" -Time "16:30"

Write-Host "----------------------------------"
Write-Host "Tudo pronto! O squad rodara automaticamente 2x ao dia."
Write-Host "Verifique os logs em _opensquad/logs/scheduled/"
Write-Host "----------------------------------"
