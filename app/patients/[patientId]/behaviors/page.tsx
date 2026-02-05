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
import { ArrowLeft } from 'lucide-react'
import { CreateBehaviorSheet } from './create-behavior-sheet'
import { ROUTES } from '@/constants/routes'
import { Behavior } from '@/app/types'
import { ToggleBehavior } from './toggle-behavior'

const DECIMAL_RADIX = 10
const FIRST_NAME_INDEX = 0

interface BehaviorsPageProps {
  params: Promise<{ patientId: string }>
}

export default async function BehaviorsPage({ params }: BehaviorsPageProps) {
  const { patientId } = await params
  const patientIdNum = parseInt(patientId, DECIMAL_RADIX)

  const isInvalidPatientId = isNaN(patientIdNum)
  if (isInvalidPatientId) {
    redirect(ROUTES.PATIENTS)
  }

  const patientResult = await getPatient(patientIdNum)
  const isPatientNotFound = !patientResult.success || !patientResult.data
  if (isPatientNotFound) {
    redirect(ROUTES.PATIENTS)
  }

  const behaviorsResult = await getPatientBehaviors(patientIdNum)
  const behaviors = behaviorsResult.success ? behaviorsResult.data || [] : []
  const patientName = patientResult.data.name.split(' ')[FIRST_NAME_INDEX]

  function renderBehaviorType(behavior: Behavior) {
    const behaviorType = behavior.behaviorType
    return behaviorType === 'adaptive' ? 'Adaptativo' : 'Desadaptativo'
  }

  function renderEmptyState() {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4 text-sm">
            Nenhum comportamento adicionado. Adicione comportamentos para
            começar a monitorar.
          </p>
          <CreateBehaviorSheet patientId={patientIdNum} />
        </CardContent>
      </Card>
    )
  }

  function renderBehaviorsList() {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {behaviors.map((behavior) => (
          <Card
            key={behavior.id}
            className="relative flex h-24 w-full justify-between transition-shadow hover:shadow-lg"
          >
            <CardHeader className="justify-center">
              <CardTitle className="text-xs font-medium">
                <span>{behavior.name}</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground -mt-1 text-xs">
                {renderBehaviorType(behavior)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ToggleBehavior
                behaviorId={behavior.id}
                isActive={behavior.isActive}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  function renderBehaviorsContent() {
    const hasBehaviors = behaviors.length > 0

    if (!hasBehaviors) {
      return renderEmptyState()
    }

    return renderBehaviorsList()
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link href={ROUTES.PATIENT.replace(':patientId', patientId)}>
          <Button variant="link" className="mb-2">
            <ArrowLeft className="size-4" />
            Voltar para {patientName}
          </Button>
        </Link>
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Comportamentos</h1>
          <p className="text-muted-foreground mb-4 text-sm">
            Gerencie os comportamentos de {patientName}
          </p>
          <CreateBehaviorSheet patientId={patientIdNum} />
        </div>
      </div>

      {renderBehaviorsContent()}
    </div>
  )
}
