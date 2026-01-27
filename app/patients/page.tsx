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

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">
            Manage your patients and start therapy sessions
          </p>
        </div>
        <CreatePatientDialog />
      </div>

      {patients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No patients yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first patient to start tracking therapy sessions
            </p>
            <CreatePatientDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Card
              key={patient.id}
              className="transition-shadow hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {patient.name}
                </CardTitle>
                <CardDescription>
                  Created {new Date(patient.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/patients/${patient.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link
                    href={`/patients/${patient.id}/behaviors`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      Behaviors
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
