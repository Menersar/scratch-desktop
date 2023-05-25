!macro customInstall
    #WriteRegStr HKCR "sidekick" "" "URL:sidekick"
    #WriteRegStr HKCR "sidekick" "URL Protocol" ""
    #WriteRegStr HKCR "sidekick\shell\open\command" "" '"$INSTDIR\Sidekick.exe"'
    
    WriteRegStr HKCR ".sb2" "" "sidekick.sb2"
    WriteRegStr HKCR ".sb2" "Content Type" "application/x-zip-compressed"
    WriteRegStr HKCR ".sb2" "PerceivedType" "compressed"
    WriteRegStr HKCR ".sb2\OpenWithProgIds" "sidekick.sb2" ""
    
    WriteRegStr HKCR ".sb3" "" "sidekick.sb3"
    WriteRegStr HKCR ".sb3" "Content Type" "application/x-zip-compressed"
    WriteRegStr HKCR ".sb3" "PerceivedType" "compressed"
    WriteRegStr HKCR ".sb3\OpenWithProgIds" "sidekick.sb3" ""
    
    WriteRegStr HKCR ".sk" "" "sidekick.sk"
    WriteRegStr HKCR ".sk" "Content Type" "application/x-zip-compressed"
    WriteRegStr HKCR ".sk" "PerceivedType" "compressed"
    WriteRegStr HKCR ".sk\OpenWithProgIds" "sidekick.sk" ""
    
    WriteRegStr HKCR ".skx" "" "sidekick.skx"
    WriteRegStr HKCR ".skx" "Content Type" "application/x-zip-compressed"
    WriteRegStr HKCR ".skx" "PerceivedType" "compressed"
    WriteRegStr HKCR ".sk\OpenWithProgIds" "sidekick.skx" ""
    
    WriteRegStr HKCR "sidekick.sb2" "" "Scratch 2 File"
    WriteRegStr HKCR "sidekick.sb2\DefaultIcon" "" '"$INSTDIR\resources\icon\sk.ico"'
    WriteRegStr HKCR "sidekick.sb2\shell\open\command" "" '"$INSTDIR\Sidekick.exe" "%1"'
    
    WriteRegStr HKCR "sidekick.sb3" "" "Scratch 3 File"
    WriteRegStr HKCR "sidekick.sb3\DefaultIcon" "" '"$INSTDIR\resources\icon\sk.ico"'
    WriteRegStr HKCR "sidekick.sb3\shell\open\command" "" '"$INSTDIR\Sidekick.exe" "%1"'
    
    WriteRegStr HKCR "sidekick.sk" "" "Sidekick File"
    WriteRegStr HKCR "sidekick.sk\DefaultIcon" "" '"$INSTDIR\resources\icon\sk.ico"'
    WriteRegStr HKCR "sidekick.sk\shell\open\command" "" '"$INSTDIR\Sidekick.exe" "%1"'
    
    WriteRegStr HKCR "sidekick.skx" "" "Sidekick 3 Extension"
    WriteRegStr HKCR "sidekick.skx\DefaultIcon" "" '"$INSTDIR\resources\icon\sk.ico"'
    WriteRegStr HKCR "sidekick.skx\shell\open\command" "" '"$INSTDIR\Sidekick.exe" "%1"'
!macroend
