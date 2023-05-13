!macro customInstall
    #WriteRegStr HKCR "scratch" "" "URL:scratch"
    #WriteRegStr HKCR "scratch" "URL Protocol" ""
    #WriteRegStr HKCR "scratch\shell\open\command" "" '"$INSTDIR\Scratch 3.exe"'
    
    WriteRegStr HKCR ".sb2" "" "scratch.sb2"
    WriteRegStr HKCR ".sb2" "Content Type" "application/x-zip-compressed"
    WriteRegStr HKCR ".sb2" "PerceivedType" "compressed"
    WriteRegStr HKCR ".sb2\OpenWithProgIds" "scratch.sb2" ""
    
    WriteRegStr HKCR ".sb3" "" "scratch.sb3"
    WriteRegStr HKCR ".sb3" "Content Type" "application/x-zip-compressed"
    WriteRegStr HKCR ".sb3" "PerceivedType" "compressed"
    WriteRegStr HKCR ".sb3\OpenWithProgIds" "scratch.sb3" ""
    
    WriteRegStr HKCR ".sk" "" "scratch.sk"
    WriteRegStr HKCR ".sk" "Content Type" "application/x-zip-compressed"
    WriteRegStr HKCR ".sk" "PerceivedType" "compressed"
    WriteRegStr HKCR ".sk\OpenWithProgIds" "scratch.sk" ""
    
    WriteRegStr HKCR ".skx" "" "scratch.skx"
    WriteRegStr HKCR ".skx" "Content Type" "application/x-zip-compressed"
    WriteRegStr HKCR ".skx" "PerceivedType" "compressed"
    WriteRegStr HKCR ".sk\OpenWithProgIds" "scratch.skx" ""
    
    WriteRegStr HKCR "scratch.sb2" "" "Scratch 2 File"
    WriteRegStr HKCR "scratch.sb2\DefaultIcon" "" '"$INSTDIR\resources\icon\sk.ico"'
    WriteRegStr HKCR "scratch.sb2\shell\open\command" "" '"$INSTDIR\Scratch 3.exe" "%1"'
    
    WriteRegStr HKCR "scratch.sb3" "" "Scratch 3 File"
    WriteRegStr HKCR "scratch.sb3\DefaultIcon" "" '"$INSTDIR\resources\icon\sk.ico"'
    WriteRegStr HKCR "scratch.sb3\shell\open\command" "" '"$INSTDIR\Scratch 3.exe" "%1"'
    
    WriteRegStr HKCR "scratch.sk" "" "Scratch 3 File"
    WriteRegStr HKCR "scratch.sk\DefaultIcon" "" '"$INSTDIR\resources\icon\sk.ico"'
    WriteRegStr HKCR "scratch.sk\shell\open\command" "" '"$INSTDIR\Scratch 3.exe" "%1"'
    
    WriteRegStr HKCR "scratch.skx" "" "Scratch 3 Extension"
    WriteRegStr HKCR "scratch.skx\DefaultIcon" "" '"$INSTDIR\resources\icon\sk.ico"'
    WriteRegStr HKCR "scratch.skx\shell\open\command" "" '"$INSTDIR\Scratch 3.exe" "%1"'
!macroend
