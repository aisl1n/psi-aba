import { getPatient } from '@/app/src/actions/patient-actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { StartSessionButton } from './start-session-button'

interface PatientPageProps {
  params: Promise<{ patientId: string }>
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { patientId } = await params
  const patientIdNum = parseInt(patientId, 10)

  if (isNaN(patientIdNum)) {
    redirect('/patients')
  }

  const result = await getPatient(patientIdNum)

  if (!result.success || !result.data) {
    redirect('/patients')
  }

  const patient = result.data
  const behaviors = patient.behaviors || []
  const sessions = patient.sessions || []

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link href="/patients">
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to Patients
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{patient.name}</h1>
        <p className="text-muted-foreground">
          Created {new Date(patient.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <StartSessionButton patientId={patientIdNum} />
        <Link href={`/patients/${patientId}/behaviors`}>
          <Button variant="outline">Manage Behaviors</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Behaviors Card */}
        <Card>
          <CardHeader>
            <CardTitle>Behaviors</CardTitle>
            <CardDescription>
              {behaviors.length} active behavior
              {behaviors.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {behaviors.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No behaviors configured. Add behaviors to start tracking.
              </p>
            ) : (
              <div className="space-y-2">
                {behaviors.slice(0, 5).map((behavior) => (
                  <div
                    key={behavior.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <span className="text-sm font-medium">{behavior.name}</span>
                    <div className="text-muted-foreground flex gap-2 text-xs">
                      {behavior.tracksFrequency && <span>Count</span>}
                      {behavior.tracksDuration && <span>Timer</span>}
                    </div>
                  </div>
                ))}
                {behaviors.length > 5 && (
                  <p className="text-muted-foreground text-xs">
                    +{behaviors.length - 5} more
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No sessions yet. Start a session to begin tracking.
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span className="text-sm">
                        {new Date(session.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {session.endedAt ? (
                      <span className="text-muted-foreground text-xs">
                        Completed
                      </span>
                    ) : (
                      <Link href={`/session/${session.id}`}>
                        <Button variant="link" size="sm">
                          Continue
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
