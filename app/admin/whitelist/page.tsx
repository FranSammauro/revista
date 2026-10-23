import WhitelistClient from '@/components/WhitelistClient'
import { SUBJECTS } from '@/lib/subjects'

export default function WhitelistPage() {
  return <WhitelistClient subjects={SUBJECTS} />
}
