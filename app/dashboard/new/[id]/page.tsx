import { redirect } from "next/navigation"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmitButton } from "@/app/components/SubmitButtons"
import Link from "next/link"
import prisma from "@/app/lib/db"

async function getData({
 userId,
 noteId
}: {
 userId: string
 noteId: string
}) {
 noStore()
 const data = await prisma.note.findUnique({
  where: {
   id: noteId,
   userId: userId
  },
  select: {
   title: true,
   description: true,
   id: true
  }
 })

 return data
}

export default async function DynamicRoute({
 params
}: {
 params: { id: string }
}) {
 const { getUser } = getKindeServerSession()
 const user = await getUser()
 const data = await getData({
  userId: user?.id as string,
  noteId: params.id
 })

 async function postData(formData: FormData) {
  "use server"

  if (!user) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  await prisma.note.update({
   where: {
    id: data?.id,
    userId: user.id
   },
   data: {
    description: description,
    title: title
   }
  })

  revalidatePath("/dashboard")
  return redirect("/dashboard")
 }

 return (
  <Card>
   <form action={postData}>
    <CardHeader>
     <CardTitle>Edit Note</CardTitle>
     <CardDescription>Edit your notes here</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-y-5">
     <div className="gap-y-2 flex flex-col">
      <Label>Title</Label>
      <Input
       type="text"
       name="title"
       placeholder="Title"
       defaultValue={data?.title}
       required
      />
     </div>
     <div className="flex flex-col gap-y-2">
      <Label>Description</Label>
      <Textarea
       name="description"
       placeholder="Description"
       defaultValue={data?.description}
       required
      />
     </div>
    </CardContent>
    <CardFooter className="flex justify-between">
     <Button asChild variant="destructive">
      <Link href={"/dashboard"}>Cancel</Link>
     </Button>
     <SubmitButton />
    </CardFooter>
   </form>
  </Card>
 )
}