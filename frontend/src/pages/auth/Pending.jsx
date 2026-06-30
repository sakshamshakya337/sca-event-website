import { Link } from 'react-router-dom'
import { Clock, Home } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function Pending() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <main className="w-full max-w-md">
        <Card className="p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="text-yellow-600 dark:text-yellow-400" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-brand-navy dark:text-white mb-3">
            Account Pending Approval
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Your account is currently being reviewed by an administrator. You will receive an email once your account is approved.
          </p>
          <Link to="/">
            <Button className="w-full flex items-center justify-center gap-2">
              <Home size={18} />
              Back to Home
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  )
}
