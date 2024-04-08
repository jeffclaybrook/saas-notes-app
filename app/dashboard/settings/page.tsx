import { revalidatePath, unstable_noStore as noStore } from "next/cache"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { SubmitButton } from "@/app/components/SubmitButtons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import prisma from "@/app/lib/db"

const colors = [
 { value: "theme-green", label: "Green" },
 { value: "theme-blue", label: "Blue" },
 { value: "theme-violet", label: "Violet" },
 { value: "theme-yellow", label: "Yellow" },
 { value: "theme-orange", label: "Orange" },
 { value: "theme-red", label: "Red" },
 { value: "theme-rose", label: "Rose" }
]

async function getData(userId: string) {
 noStore()
 const data = await prisma.user.findUnique({
  where: {
   id: userId
  },
  select: {
   name: true,
   email: true,
   colorScheme: true
  }
 })

 return data
}

export default async function SettingsPage() {
 const { getUser } = getKindeServerSession()
 const user = await getUser()
 const data = await getData(user?.id as string)

 async function postData(formData: FormData) {
  "use server"

  const name = formData.get("name")
  const colorScheme = formData.get("color") as string

  await prisma.user.update({
   where: {
    id: user?.id
   },
   data: {
    name: name ?? undefined,
    colorScheme: colorScheme ?? undefined
   }
  })

  revalidatePath("/", "layout")
 }

 return (
  <div className="grid items-start gap-8">
   <div className="flex items-center justify-between px-2">
    <div className="grid gap-1">
     <h1 className="text-3xl md:text-4xl">Settings</h1>
     <p className="text-lg text-muted-foreground">Your Profile Settings</p>
    </div>
   </div>
   <Card>
    <form action={postData}>
     <CardHeader>
      <CardTitle>General Data</CardTitle>
      <CardDescription>Please provide general information about yourself</CardDescription>
     </CardHeader>
     <CardContent>
      <div className="space-y-2">
       <div className="space-y-1">
        <Label>Name</Label>
        <Input
         type="text"
         name="name"
         id="name"
         placeholder="Name"
         defaultValue={data?.name ?? undefined}
        />
       </div>
       <div className="space-y-1">
        <Label>Email</Label>
        <Input
         type="email"
         name="email"
         id="email"
         placeholder="Email"
         defaultValue={data?.email as string}
         disabled
        />
       </div>
       <div className="space-y-1">
        <Label>Color Scheme</Label>
        <Select name="color" defaultValue={data?.colorScheme}>
         <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a color" />
         </SelectTrigger>
         <SelectContent>
          <SelectGroup>
           <SelectLabel>Color</SelectLabel>
           {colors.map((item, i) => (
            <SelectItem key={i} value={item.value}>{item.label}</SelectItem>
           ))}
          </SelectGroup>
         </SelectContent>
        </Select>
       </div>
      </div>
     </CardContent>
     <CardFooter>
      <SubmitButton />
     </CardFooter>
    </form>
   </Card>
  </div>
 )
}