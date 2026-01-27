import { getPatientBehaviors } from '@/app/src/actions/behavior-actions'
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
import { ArrowLeft, Clock, Hash } from 'lucide-react'
import { CreateBehaviorDialog } from './create-behavior-dialog'

interface BehaviorsPageProps {
  params: Promise<{ patientId: string }>
}

export default async function BehaviorsPage({ params }: BehaviorsPageProps) {
  const { patientId } = await params
  const patientIdNum = parseInt(patientId, 10)

  if (isNaN(patientIdNum)) {
    redirect('/patients')
  }

  // Verify patient exists
  const patientResult = await getPatient(patientIdNum)
  if (!patientResult.success || !patientResult.data) {
    redirect('/patients')
  }

  const behaviorsResult = await getPatientBehaviors(patientIdNum)
  const behaviors = behaviorsResult.success ? behaviorsResult.data || [] : []

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link href={`/patients/${patientId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patient
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Behaviors</h1>
            <p className="text-muted-foreground">
              Manage behaviors for {patientResult.data.name}
            </p>
          </div>
          <CreateBehaviorDialog patientId={patientIdNum} />
        </div>
      </div>

      {behaviors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No behaviors configured yet. Create your first behavior to start
              tracking.
            </p>
            <CreateBehaviorDialog patientId={patientIdNum} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {behaviors.map((behavior) => (
            <Card key={behavior.id}>
              <CardHeader>
                <CardTitle>{behavior.name}</CardTitle>
                <CardDescription>
                  {behavior.isActive ? 'Active' : 'Inactive'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap gap-2">
                  {behavior.tracksFrequency && (
                    <div className="bg-secondary flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                      <Hash className="h-3 w-3" />
                      Frequency
                    </div>
                  )}
                  {behavior.tracksDuration && (
                    <div className="bg-secondary flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                      <Clock className="h-3 w-3" />
                      Duration
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
