local inMinigame = false
local Result = false

RegisterNUICallback("result", function(data, cb)
    SetNuiFocus(false,false)
    cb('ok')
    Result = data.result
    inMinigame = false
end)

startMinigame = function()
    SetNuiFocus(true,true)
    SendNUIMessage({
        type = "start",
    })
    inMinigame = true

    repeat Wait(25) until not inMinigame
    return Result
end

stopMinigame = function()
    SetNuiFocus(false,false)
    SendNUIMessage({
        type = "stop",
    })
    inMinigame = false
    Result = false
end