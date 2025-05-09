"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, X, Plus, Clock } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Datos de ejemplo para las instalaciones
const facilitiesData = [
  { id: 1, name: "Cancha de Fútbol (Grass)", location: "Parque Juan Pablo II" },
  { id: 2, name: "Piscina Municipal", location: "Complejo Deportivo Municipal" },
  { id: 3, name: "Gimnasio Municipal", location: "Complejo Deportivo Municipal" },
  { id: 4, name: "Pista de Atletismo", location: "Complejo Deportivo Municipal" },
  { id: 5, name: "Cancha de Tenis", location: "Parque Juan Pablo II" },
  { id: 6, name: "Cancha de Básquetbol", location: "Parque Juan Pablo II" },
  { id: 7, name: "Cancha de Voleibol", location: "Complejo Deportivo Municipal" },
  { id: 8, name: "Sala de Artes Marciales", location: "Gimnasio Municipal" },
]

// Datos de ejemplo para coordinadores sin asignar
const unassignedCoordinators = [
  { id: 4, name: "Ana Martínez", email: "ana.martinez@example.com", phone: "987-654-324" },
  { id: 5, name: "Pedro Sánchez", email: "pedro.sanchez@example.com", phone: "987-654-325" },
]

// Días de la semana
const weekDays = [
  { id: "lunes", name: "Lunes" },
  { id: "martes", name: "Martes" },
  { id: "miercoles", name: "Miércoles" },
  { id: "jueves", name: "Jueves" },
  { id: "viernes", name: "Viernes" },
  { id: "sabado", name: "Sábado" },
  { id: "domingo", name: "Domingo" },
]

// Horarios disponibles
const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
]

export default function NuevoCoordinadorPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [selectedCoordinator, setSelectedCoordinator] = useState("")
  const [selectedFacilities, setSelectedFacilities] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  
  // Nuevo estado para manejar los horarios por instalación
  const [facilitySchedules, setFacilitySchedules] = useState({})
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [selectedDay, setSelectedDay] = useState("lunes")
  
  // Estado para manejar los horarios temporales que se están agregando
  const [tempSchedule, setTempSchedule] = useState({
    startTime: "08:00",
    endTime: "17:00"
  })

  // Efecto para inicializar los horarios cuando se seleccionan instalaciones
  useEffect(() => {
    const newFacilitySchedules = {}
    
    selectedFacilities.forEach(facilityId => {
      if (!facilitySchedules[facilityId]) {
        newFacilitySchedules[facilityId] = {
          facilityId,
          schedules: []
        }
      }
    })
    
    setFacilitySchedules(prev => ({
      ...prev,
      ...newFacilitySchedules
    }))
    
    // Limpiar horarios de instalaciones que ya no están seleccionadas
    const updatedSchedules = {}
    Object.keys(facilitySchedules).forEach(id => {
      if (selectedFacilities.includes(Number(id))) {
        updatedSchedules[id] = facilitySchedules[id]
      }
    })
    
    setFacilitySchedules(updatedSchedules)
    
    // Seleccionar la primera instalación por defecto si hay alguna
    if (selectedFacilities.length > 0 && !selectedFacility) {
      setSelectedFacility(selectedFacilities[0])
    } else if (selectedFacilities.length === 0) {
      setSelectedFacility(null)
    } else if (selectedFacility && !selectedFacilities.includes(selectedFacility)) {
      setSelectedFacility(selectedFacilities[0])
    }
  }, [selectedFacilities])

  const handleCoordinatorChange = (value) => {
    setSelectedCoordinator(value)
  }

  const toggleFacility = (facilityId) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId) ? prev.filter((id) => id !== facilityId) : [...prev, facilityId],
    )
  }

  const handleFacilitySelect = (facilityId) => {
    setSelectedFacility(facilityId)
  }

  const handleDaySelect = (day) => {
    setSelectedDay(day)
  }

  const updateTempSchedule = (field, value) => {
    setTempSchedule(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addScheduleToFacility = () => {
    if (!selectedFacility || !selectedDay) return
    
    // Validar que la hora de inicio sea anterior a la hora de fin
    const startHour = parseInt(tempSchedule.startTime.split(':')[0])
    const endHour = parseInt(tempSchedule.endTime.split(':')[0])
    
    if (startHour >= endHour) {
      toast({
        title: "Error de horario",
        description: "La hora de inicio debe ser anterior a la hora de fin.",
        variant: "destructive",
      })
      return
    }
    
    // Verificar si hay solapamiento con otros horarios del mismo día en TODAS las instalaciones
    let hasOverlap = false
    let overlapFacilityName = ""
    
    // Primero verificamos solapamiento en la misma instalación
    const existingSchedules = facilitySchedules[selectedFacility]?.schedules || []
    const sameDaySchedules = existingSchedules.filter(s => s.day === selectedDay)
    
    hasOverlap = sameDaySchedules.some(schedule => {
      const existingStart = parseInt(schedule.startTime.split(':')[0])
      const existingEnd = parseInt(schedule.endTime.split(':')[0])
      
      // Verificar solapamiento
      return (startHour < existingEnd && endHour > existingStart)
    })
    
    if (hasOverlap) {
      toast({
        title: "Solapamiento de horarios",
        description: "El horario se solapa con otro ya asignado para este día y esta instalación.",
        variant: "destructive",
      })
      return
    }
    
    // Ahora verificamos solapamiento con otras instalaciones asignadas al mismo coordinador
    for (const facilityId of selectedFacilities) {
      // Saltamos la instalación actual que ya verificamos
      if (facilityId === selectedFacility) continue
      
      const otherFacilitySchedules = facilitySchedules[facilityId]?.schedules || []
      const otherSameDaySchedules = otherFacilitySchedules.filter(s => s.day === selectedDay)
      
      const overlap = otherSameDaySchedules.some(schedule => {
        const existingStart = parseInt(schedule.startTime.split(':')[0])
        const existingEnd = parseInt(schedule.endTime.split(':')[0])
        
        // Verificar solapamiento
        return (startHour < existingEnd && endHour > existingStart)
      })
      
      if (overlap) {
        hasOverlap = true
        overlapFacilityName = facilitiesData.find(f => f.id === facilityId)?.name || `ID: ${facilityId}`
        break
      }
    }
    
    if (hasOverlap) {
      toast({
        title: "Solapamiento de horarios entre instalaciones",
        description: `El horario se solapa con otro ya asignado para este día en la instalación: ${overlapFacilityName}. Un coordinador no puede estar en dos instalaciones al mismo tiempo.`,
        variant: "destructive",
      })
      return
    }
    
    // Agregar el nuevo horario
    const newSchedule = {
      id: Date.now(), // ID único para facilitar eliminación
      day: selectedDay,
      startTime: tempSchedule.startTime,
      endTime: tempSchedule.endTime
    }
    
    setFacilitySchedules(prev => ({
      ...prev,
      [selectedFacility]: {
        facilityId: selectedFacility,
        schedules: [...(prev[selectedFacility]?.schedules || []), newSchedule]
      }
    }))
  }

  const removeSchedule = (facilityId, scheduleId) => {
    setFacilitySchedules(prev => {
      const updatedFacility = {
        ...prev[facilityId],
        schedules: prev[facilityId].schedules.filter(s => s.id !== scheduleId)
      }
      
      return {
        ...prev,
        [facilityId]: updatedFacility
      }
    })
  }

  const filteredFacilities = facilitiesData.filter(
    (facility) =>
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validación básica
    if (!selectedCoordinator) {
      toast({
        title: "Error",
        description: "Por favor selecciona un coordinador.",
        variant: "destructive",
      })
      return
    }

    if (selectedFacilities.length === 0) {
      toast({
        title: "Error",
        description: "Debes asignar al menos una instalación al coordinador.",
        variant: "destructive",
      })
      return
    }

    // Verificar que todas las instalaciones tengan al menos un horario asignado
    const facilitiesWithoutSchedules = selectedFacilities.filter(facilityId => {
      return !facilitySchedules[facilityId] || facilitySchedules[facilityId].schedules.length === 0
    })
    
    if (facilitiesWithoutSchedules.length > 0) {
      const facilityNames = facilitiesWithoutSchedules.map(id => {
        const facility = facilitiesData.find(f => f.id === id)
        return facility ? facility.name : `ID: ${id}`
      }).join(", ")
      
      toast({
        title: "Error",
        description: `Debes asignar al menos un horario a cada instalación. Faltan horarios en: ${facilityNames}`,
        variant: "destructive",
      })
      return
    }

    // Aquí iría la lógica para asignar instalaciones y horarios al coordinador
    console.log("Asignando instalaciones y horarios al coordinador:", {
      coordinatorId: selectedCoordinator,
      facilities: selectedFacilities,
      facilitySchedules: facilitySchedules
    })

    toast({
      title: "Coordinador creado",
      description: "El coordinador ha sido creado exitosamente.",
    })

    // Redireccionar a la lista de coordinadores
    router.push("/admin/coordinadores")
  }

  // Obtener el nombre de la instalación seleccionada
  const selectedFacilityName = selectedFacility ? 
    facilitiesData.find(f => f.id === selectedFacility)?.name : ""

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/admin/coordinadores">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Asignar Instalaciones a Coordinador</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Coordinador</CardTitle>
                <CardDescription>Elige un coordinador disponible para asignarle instalaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coordinator">
                    Coordinador <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedCoordinator} onValueChange={handleCoordinatorChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un coordinador" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedCoordinators.map((coordinator) => (
                        <SelectItem key={coordinator.id} value={coordinator.id.toString()}>
                          {coordinator.name} - {coordinator.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horarios por Instalación</CardTitle>
                <CardDescription>Configura los horarios específicos para cada instalación seleccionada</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="config">
                  <TabsList className="mb-4">
                    <TabsTrigger value="config">Configuración</TabsTrigger>
                    <TabsTrigger value="calendar">Vista Calendario</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="config">
                {selectedFacilities.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {selectedFacilities.map((facilityId) => {
                        const facility = facilitiesData.find((f) => f.id === facilityId)
                        const scheduleCount = facilitySchedules[facilityId]?.schedules.length || 0
                        return (
                          <Badge 
                            key={facilityId} 
                            variant={selectedFacility === facilityId ? "default" : "outline"} 
                            className="cursor-pointer flex items-center gap-1 py-2"
                            onClick={() => handleFacilitySelect(facilityId)}
                          >
                            {facility?.name}
                            <span className="ml-1 text-xs bg-gray-200 text-gray-800 rounded-full px-1.5">
                              {scheduleCount}
                            </span>
                          </Badge>
                        )
                      })}
                    </div>
                    
                    {selectedFacility && (
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-4">Configurar horarios para: {selectedFacilityName}</h3>
                        
                        <Tabs defaultValue={selectedDay} onValueChange={handleDaySelect}>
                          <TabsList className="mb-4 flex flex-wrap h-auto">
                            {weekDays.map((day) => (
                              <TabsTrigger key={day.id} value={day.id} className="flex-1">
                                {day.name}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          
                          {weekDays.map((day) => (
                            <TabsContent key={day.id} value={day.id} className="space-y-4">
                              <div className="flex items-end gap-4">
                                <div className="space-y-1 flex-1">
                                  <Label htmlFor={`start-${day.id}`} className="text-xs">
                                    Hora inicio
                                  </Label>
                                  <Select
                                    value={tempSchedule.startTime}
                                    onValueChange={(value) => updateTempSchedule("startTime", value)}
                                  >
                                    <SelectTrigger id={`start-${day.id}`}>
                                      <SelectValue placeholder="Hora inicio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {timeSlots.map((time) => (
                                        <SelectItem key={`start-${day.id}-${time}`} value={time}>
                                          {time}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1 flex-1">
                                  <Label htmlFor={`end-${day.id}`} className="text-xs">
                                    Hora fin
                                  </Label>
                                  <Select
                                    value={tempSchedule.endTime}
                                    onValueChange={(value) => updateTempSchedule("endTime", value)}
                                  >
                                    <SelectTrigger id={`end-${day.id}`}>
                                      <SelectValue placeholder="Hora fin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {timeSlots.map((time) => (
                                        <SelectItem key={`end-${day.id}-${time}`} value={time}>
                                          {time}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button 
                                  type="button" 
                                  onClick={addScheduleToFacility}
                                  className="mb-0.5"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Agregar
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Horarios asignados para {day.name}:</h4>
                                {facilitySchedules[selectedFacility]?.schedules.filter(s => s.day === day.id).length > 0 ? (
                                  <div className="space-y-2">
                                    {facilitySchedules[selectedFacility].schedules
                                      .filter(s => s.day === day.id)
                                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                      .map(schedule => (
                                        <div key={schedule.id} className="flex items-center justify-between p-2 border rounded-md">
                                          <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                            <span>
                                              {schedule.startTime} - {schedule.endTime}
                                            </span>
                                          </div>
                                          <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => removeSchedule(selectedFacility, schedule.id)}
                                            className="text-red-500 h-8 w-8 p-0"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))
                                    }
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">No hay horarios asignados para este día</p>
                                )}
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 border rounded-md">
                    <p className="text-gray-500">Selecciona al menos una instalación para configurar horarios</p>
                  </div>
                )}
                  </TabsContent>
                  
                  <TabsContent value="calendar">
                    {Object.keys(facilitySchedules).length > 0 ? (
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-4">Horario Semanal del Coordinador</h3>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-2 bg-gray-50 w-20">Hora</th>
                                {weekDays.map(day => (
                                  <th key={day.id} className="border p-2 bg-gray-50">{day.name}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {timeSlots.map((time, index) => {
                                // Saltamos la última hora porque solo la usamos como hora de fin
                                if (index === timeSlots.length - 1) return null;
                                
                                const startHour = parseInt(time.split(':')[0]);
                                const endHour = parseInt(timeSlots[index + 1].split(':')[0]);
                                
                                return (
                                  <tr key={time}>
                                    <td className="border p-2 text-center text-sm font-medium">
                                      {time} - {timeSlots[index + 1]}
                                    </td>
                                    
                                    {weekDays.map(day => {
                                      // Buscar todos los horarios que coinciden con este día y hora
                                      const schedulesInThisSlot = [];
                                      
                                      Object.keys(facilitySchedules).forEach(facilityId => {
                                        const facilityScheduleList = facilitySchedules[facilityId].schedules;
                                        
                                        facilityScheduleList.forEach(schedule => {
                                          if (schedule.day === day.id) {
                                            const scheduleStart = parseInt(schedule.startTime.split(':')[0]);
                                            const scheduleEnd = parseInt(schedule.endTime.split(':')[0]);
                                            
                                            // Verificar si este horario cae en el slot actual
                                            if (scheduleStart <= startHour && scheduleEnd > startHour) {
                                              const facility = facilitiesData.find(f => f.id === Number(facilityId));
                                              schedulesInThisSlot.push({
                                                facilityId: Number(facilityId),
                                                facilityName: facility?.name || `ID: ${facilityId}`,
                                                startTime: schedule.startTime,
                                                endTime: schedule.endTime
                                              });
                                            }
                                          }
                                        });
                                      });
                                      
                                      return (
                                        <td key={`${day.id}-${time}`} className="border p-1 align-top">
                                          {schedulesInThisSlot.length > 0 ? (
                                            <div className="space-y-1">
                                              {schedulesInThisSlot.map((schedule, idx) => (
                                                <div 
                                                  key={idx} 
                                                  className={`text-xs p-1 rounded ${schedulesInThisSlot.length > 1 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                                                >
                                                  {schedule.facilityName}
                                                  {schedulesInThisSlot.length > 1 && (
                                                    <div className="text-xs font-bold text-red-600 mt-1">
                                                      ¡Conflicto de horario!
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          ) : null}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="mt-4 text-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 bg-blue-100 rounded"></div>
                            <span>Horario asignado</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-100 rounded"></div>
                            <span className="text-red-600 font-medium">Conflicto de horarios</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-6 border rounded-md">
                        <p className="text-gray-500">No hay horarios asignados para mostrar en el calendario</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Instalaciones Asignadas</CardTitle>
                <CardDescription>Selecciona las instalaciones que supervisará este coordinador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Buscar instalación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="border rounded-md p-4 h-[300px] overflow-y-auto">
                  {filteredFacilities.length > 0 ? (
                    <div className="space-y-2">
                      {filteredFacilities.map((facility) => (
                        <div key={facility.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`facility-${facility.id}`}
                            checked={selectedFacilities.includes(facility.id)}
                            onCheckedChange={() => toggleFacility(facility.id)}
                          />
                          <Label htmlFor={`facility-${facility.id}`} className="flex-1 cursor-pointer text-sm">
                            {facility.name}
                            <span className="block text-xs text-gray-500">{facility.location}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No se encontraron instalaciones</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Instalaciones seleccionadas:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFacilities.length > 0 ? (
                      selectedFacilities.map((facilityId) => {
                        const facility = facilitiesData.find((f) => f.id === facilityId)
                        return (
                          <Badge key={facilityId} variant="secondary" className="flex items-center gap-1">
                            {facility?.name}
                            <button
                              type="button"
                              onClick={() => toggleFacility(facilityId)}
                              className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Eliminar</span>
                            </button>
                          </Badge>
                        )
                      })
                    ) : (
                      <p className="text-sm text-gray-500">Ninguna instalación seleccionada</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/admin/coordinadores">Cancelar</Link>
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary-light">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Coordinador
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

