import { useEffect } from "react"
import type { Socket } from "socket.io-client"
import { getSharedSocket } from "@/shared/lib/socket"

type EventHandler<T = unknown> = (payload: T) => void

export function useSocketEvent<T = unknown>(eventName: string, handler: EventHandler<T>) {
  useEffect(() => {
    const socket = getSharedSocket()
    const wrappedHandler = (payload: T) => handler(payload)
    socket.on(eventName, wrappedHandler)
    return () => {
      socket.off(eventName, wrappedHandler)
    }
  }, [eventName, handler])
}

export function useSocketConnection(onConnectionChange?: (connected: boolean, socket: Socket) => void) {
  useEffect(() => {
    const socket = getSharedSocket()

    const onConnect = () => onConnectionChange?.(true, socket)
    const onDisconnect = () => onConnectionChange?.(false, socket)

    onConnectionChange?.(socket.connected, socket)
    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [onConnectionChange])
}

