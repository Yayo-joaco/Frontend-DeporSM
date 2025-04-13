"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, AlertTriangle, Calendar, Clock, Filter } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Datos de ejemplo para las instalaciones
const facilitiesData = [
  {
    id: 1,
    name: "Cancha de Fútbol (Grass)",
    image: "/placeholder.svg?height=200&width=300",
    location: "Parque Juan Pablo II",
    status: "buen-estado",
    lastVisit: "01/04/2025",
    nextVisit: "05/04/2025, 14:00",
    isToday: true,
    observations: 2,
    pendingObservations: 1,
  },
  {
    id: 2,
    name: "Piscina Municipal",
    image: "/placeholder.svg?height=200&width=300",
    location: "Complejo Deportivo Municipal",
    status: "requiere-atencion",
    lastVisit: "02/04/2025",
    nextVisit: "05/04/2025, 16:30",
    isToday: true,
    observations: 3,
    pendingObservations: 1,
  },
  {
    id: 3,
    name: "Gimnasio Municipal",
    image: "/placeholder.svg?height=200&width=300",
    location: "Complejo Deportivo Municipal",
    status: "buen-estado",
    lastVisit: "31/03/2025",
    nextVisit: "06/04/2025, 09:00",
    isToday: false,
    observations: 1,
    pendingObservations: 0,
  },
  {
    id: 4,
    name: "Pista de Atletismo",
    image: "/placeholder.svg?height=200&width=300",
    location: "Complejo Deportivo Municipal",
    status: "mantenimiento-requerido",
    lastVisit: "30/03/2025",
    nextVisit: "06/04/2025, 11:30",
    isToday: false,
    observations: 4,
    pendingObservations: 1,
  },
  {
    id: 5,
    name: "Cancha de Fútbol (Loza)",
    image: "/placeholder.svg?height=200&width=300",
    location: "Parque Simón Bolívar",
    status: "en-mantenimiento",
    lastVisit: "29/03/2025",
    nextVisit: "No programada",
    isToday: false,
    observations: 2,
    pendingObservations: 0,
  },
]

export default function InstalacionesCoordinador() {
  const [isLoading, setIsLoading] = useState(true)
  const [facilities, setFacilities] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todas")

  useEffect(() => {
    // Simulación de carga de datos
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setFacilities(facilitiesData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    // Filtrar instalaciones por nombre o ubicación
    const filtered = facilitiesData.filter(
      (facility) =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.location.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFacilities(filtered)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)

    if (value === "todas") {
      setFacilities(facilitiesData)
    } else if (value === "hoy") {
      setFacilities(facilitiesData.filter((f) => f.isToday))
    } else if (value === "atencion") {
      setFacilities(
        facilitiesData.filter((f) => f.status === "requiere-atencion" || f.status === "mantenimiento-requerido"),
      )
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "buen-estado":
        return <Badge className="bg-green-100 text-green-800">Buen estado</Badge>
      case "requiere-atencion":
        return <Badge className="bg-yellow-100 text-yellow-800">Requiere atención</Badge>
      case "mantenimiento-requerido":
        return <Badge className="bg-red-100 text-red-800">Mantenimiento requerido</Badge>
      case "en-mantenimiento":
        return <Badge className="bg-blue-100 text-blue-800">En mantenimiento</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Instalaciones Asignadas</h1>
          <p className="text-muted-foreground">Gestiona las instalaciones deportivas a tu cargo</p>
        </div>
        <Button className="bg-primary hover:bg-primary-light" asChild>
          <Link href="/coordinador/instalaciones/mapa">
            <MapPin className="h-4 w-4 mr-2" />
            Ver en Mapa
          </Link>
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-grow flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o ubicación..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary-light">
                Buscar
              </Button>
            </form>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFacilities(facilitiesData)}>Todos</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFacilities(facilitiesData.filter((f) => f.status === "buen-estado"))}
                >
                  Buen estado
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFacilities(facilitiesData.filter((f) => f.status === "requiere-atencion"))}
                >
                  Requiere atención
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFacilities(facilitiesData.filter((f) => f.status === "mantenimiento-requerido"))}
                >
                  Mantenimiento requerido
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFacilities(facilitiesData.filter((f) => f.status === "en-mantenimiento"))}
                >
                  En mantenimiento
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas */}
      <Tabs defaultValue="todas" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="hoy">Visitas Hoy</TabsTrigger>
          <TabsTrigger value="atencion">Requieren Atención</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {facilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility) => (
                <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={facility.image || "/placeholder.svg"}
                      alt={facility.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">{getStatusBadge(facility.status)}</div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{facility.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{facility.location}</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm">Última visita:</span>
                        </div>
                        <span className="text-sm font-medium">{facility.lastVisit}</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm">Próxima visita:</span>
                        </div>
                        <span className="text-sm font-medium">
                          {facility.isToday ? (
                            <Badge className="bg-blue-100 text-blue-800">Hoy</Badge>
                          ) : (
                            facility.nextVisit
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-primary" />
                          <span className="text-sm">Observaciones:</span>
                        </div>
                        <span className="text-sm font-medium">
                          {facility.pendingObservations > 0 ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {facility.pendingObservations} pendientes
                            </Badge>
                          ) : (
                            `${facility.observations} totales`
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/coordinador/instalaciones/${facility.id}`}>Ver Detalles</Link>
                      </Button>
                      <Button asChild className="flex-1 bg-primary hover:bg-primary-light">
                        <Link href={`/coordinador/observaciones/nueva?id=${facility.id}`}>Reportar</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No se encontraron instalaciones</h3>
              <p className="text-gray-500 mt-2">No hay instalaciones que coincidan con los criterios de búsqueda.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setFacilities(facilitiesData)
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

