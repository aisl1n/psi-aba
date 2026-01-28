import { getPatients } from '@/app/src/actions/patient-actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  ActivityIcon,
  ArrowRight,
  BrainCogIcon,
  RotateCcw,
  UserRound,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import MenuCard from '@/components/menu-card'
import { Patient } from './types'

function renderQuickStartContent(patients: Patient[]) {
  const hasPatients = patients.length > 0

  const hasPatientsTitle = hasPatients
    ? 'Selecione um paciente para começar'
    : 'Adicione um paciente'

  const hasPatientsButton = hasPatients
    ? 'Iniciar sessão'
    : 'Adicionar pacientes'

  return (
    <>
      <p className="text-muted-foreground mb-2 text-xs">{hasPatientsTitle}</p>
      <Link href={ROUTES.PATIENTS}>
        <Button className="w-full">{hasPatientsButton}</Button>
      </Link>
    </>
  )
}

function renderQuickStart(patients: Patient[]) {
  return (
    <MenuCard
      title="Início rápido"
      description="Gerencie seus pacientes e seus respectivos comportamentos."
      icon={<ActivityIcon className="size-5" />}
    >
      {renderQuickStartContent(patients)}
    </MenuCard>
  )
}

function renderPatients(patients: Patient[]) {
  return (
    <MenuCard
      title="Pacientes"
      description="Gerencie seus pacientes e seus respectivos comportamentos."
      icon={<UserRound className="size-5" />}
    >
      <p className="text-xl font-bold">{patients.length}</p>
      <p className="text-muted-foreground mb-2 text-xs">
        Total de pacientes cadastrados
      </p>
      <Link href={ROUTES.PATIENTS}>
        <Button className="w-full">Visualizar</Button>
      </Link>
    </MenuCard>
  )
}

function renderRecentPatients(patients: Patient[]) {
  const hasPatients = patients.length > 0

  if (!hasPatients) return null

  return (
    <MenuCard
      title="Pacientes recentes"
      description="Veja seus monitoramentos recentes"
      icon={<RotateCcw className="size-5" />}
    >
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
                Ver
                <ArrowRight className="text-primary size-5" />
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </MenuCard>
  )
}

function renderHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="mb-2 flex flex-col items-center gap-1">
        <BrainCogIcon className="size-10" color="green" />
        <h1 className="text-2xl font-bold">ABA Tracker</h1>
        <p className="text-muted-foreground text-xs">
          Gestão de pacientes e comportamentos.
        </p>
      </div>
    </div>
  )
}

export default async function Home() {
  const result = await getPatients()
  const patients = result.success ? result.data || [] : []

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto space-y-4 p-4 md:p-6">
        {renderHeader()}
        {renderQuickStart(patients)}
        {renderPatients(patients)}
        {renderRecentPatients(patients)}
      </div>
    </div>
  )
}
