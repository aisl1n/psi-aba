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
import { User, Activity } from 'lucide-react'

export default async function Home() {
  const result = await getPatients()
  const patients = result.success ? result.data || [] : []

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">ABA Therapy Tracker</h1>
          <p className="text-muted-foreground text-lg">
            Real-time data collection for Applied Behavior Analysis therapy
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patients
              </CardTitle>
              <CardDescription>
                Manage your patients and their behaviors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-2xl font-bold">{patients.length}</p>
              <p className="text-muted-foreground mb-4 text-sm">
                Total patients registered
              </p>
              <Link href="/patients">
                <Button className="w-full">View Patients</Button>
              </Link>
            </CardContent>
          </Card>

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
