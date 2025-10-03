"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const activities = [
  {
    id: "1",
    title: "Reunião de vendas",
    date: new Date(2023, 5, 15),
    time: "14:00",
    type: "Reunião",
  },
  {
    id: "2",
    title: "Ligação de follow-up",
    date: new Date(2023, 5, 14),
    time: "10:30",
    type: "Ligação",
  },
  {
    id: "3",
    title: "Visita técnica",
    date: new Date(2023, 5, 16),
    time: "16:00",
    type: "Visita",
  },
];

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const getActivitiesForDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return [];
    return activities.filter(activity => 
      activity.date.getDate() === selectedDate.getDate() &&
      activity.date.getMonth() === selectedDate.getMonth() &&
      activity.date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const activitiesForSelectedDate = getActivitiesForDate(date);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Atividades do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesForSelectedDate.length > 0 ? (
            <div className="space-y-4">
              {activitiesForSelectedDate.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                  <Badge variant="secondary">{activity.type}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma atividade agendada para {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : 'hoje'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}