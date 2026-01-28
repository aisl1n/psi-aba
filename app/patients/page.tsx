import { getPatients } from '@/app/src/actions/patient-actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'
import Link from 'next/link'
import { CreatePatientDialog } from './create-patient-dialog'
import { Patient } from '../types'
import { ROUTES } from '@/constants/routes'

export default async function PatientsPage() {
  const result = await getPatients()

  if (!result.success) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-destructive">
          Error loading patients: {result.error}
        </p>
      </div>
    )
  }

  const patients = result.data || []

  function renderPatients(patients: Patient[]) {
    const hasPatients = patients.length > 0

    if (!hasPatients) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="text-primary mx-auto mb-4 size-12" />
            <h3 className="mb-2 text-lg font-semibold">
              Nenhum paciente cadastrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro paciente para começar a rastrear sessões de
              terapia
            </p>
            <CreatePatientDialog />
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient) => (
          <Card
            key={patient.id}
            className="border-primary border-2 transition-shadow hover:shadow-lg"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="text-primary size-5" />
                {patient.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Adicionado em {new Date(patient.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link
                  href={`${ROUTES.PATIENT.replace(':patientId', patient.id.toString())}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="border-primary w-full border-2"
                  >
                    Ver detalhes
                  </Button>
                </Link>
                <Link
                  href={ROUTES.PATIENT_BEHAVIORS.replace(
                    ':patientId',
                    patient.id.toString()
                  )}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="border-primary w-full border-2"
                  >
                    Comportamentos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie seus pacientes e inicie sessões de terapia
          </p>
        </div>
        <CreatePatientDialog />
      </div>

      {renderPatients(patients)}
    </div>
  )
}
