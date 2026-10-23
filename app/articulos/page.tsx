import { getAllArticles } from '@/lib/articles'
import ArticlesClient from '@/components/ArticlesClient'

export default async function ArticlesPage() {
  const articles = await getAllArticles()
  return <ArticlesClient initialArticles={articles} />
}
