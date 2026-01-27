import { getPatients } from '@/app/src/actions/patient-actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, Activity, BrainCogIcon } from 'lucide-react'
import { patients } from '@/db/schema'

type Patient = typeof patients.$inferSelect

function renderPatients(patients: Patient[]) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-5" />
          Pacientes
        </CardTitle>
        <CardDescription>
          Gerencie seus pacientes e seus respectivos comportamentos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{patients.length}</p>
        <p className="text-muted-foreground mb-4 text-sm">
          Total de pacientes cadastrados
        </p>
        <Link href="/patients">
          <Button className="w-full">Visualizar</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default async function Home() {
  const result = await getPatients()
  const patients = result.success ? result.data || [] : []

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-8 text-center">
          <div className="mb-2 flex flex-col items-center gap-1">
            <BrainCogIcon className="size-10" color="green" />
            <h1 className="text-2xl font-bold">ABA Tracker</h1>
            <p className="text-muted-foreground text-xs">
              Gestão de pacientes e comportamentos.
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Start
              </CardTitle>
              <CardDescription>Start a new therapy session</CardDescription>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Create a patient first to start a session
                  </p>
                  <Link href="/patients">
                    <Button className="w-full">Go to Patients</Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Select a patient to begin
                  </p>
                  <Link href="/patients">
                    <Button className="w-full">Start Session</Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {renderPatients(patients)}

        {patients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patients.slice(0, 5).map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/patients/${patient.id}`}
                    className="hover:bg-accent block rounded-md border p-3 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{patient.name}</span>
                      <Button variant="ghost" size="sm">
                        View →
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
