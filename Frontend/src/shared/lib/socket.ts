import { io, type Socket } from "socket.io-client"

let socketInstance: Socket | null = null

interface SocketConnectionTarget {
  url: string
  path: string
}

function resolveSocketTarget(): SocketConnectionTarget {
  const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? "").trim()
  if (!apiBaseUrl) {
    return {
      url: window.location.origin,
      path: "/socket.io",
    }
  }

  const parsedUrl = new URL(apiBaseUrl, window.location.origin)
  const apiPath = parsedUrl.pathname.replace(/\/+$/, "")

  return {
    url: parsedUrl.origin,
    path: apiPath && apiPath !== "/" ? `${apiPath}/socket.io` : "/socket.io",
  }
}

export function resolveSocketBaseUrl(): string {
  return resolveSocketTarget().url
}

export function getSharedSocket(): Socket {
  if (!socketInstance) {
    const { url, path } = resolveSocketTarget()
    socketInstance = io(url, { withCredentials: true, autoConnect: true, path })
  }
  return socketInstance
}

