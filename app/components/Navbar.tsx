import Link from "next/link"
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { Button } from "@/components/ui/button"
import { UserNav } from "./UserNav"
import { ThemeToggle } from "./ThemeToggle"

export async function Navbar() {
 const { isAuthenticated, getUser } = getKindeServerSession()
 const user = await getUser()

 return (
  <nav>
   <div className="container flex items-center justify-between">
    <Link href="/">
     <h1 className="font-bold text-3xl">
      Note<span className="text-primary">Saas</span>
     </h1>
    </Link>
    <div className="flex items-center gap-x-5">
     <ThemeToggle />
     {(await isAuthenticated()) ? (
      <UserNav
       email={user?.email as string}
       image={user?.picture as string}
       name={user?.given_name as string}
      />
     ) : (
      <div className="flex items-center gap-x-5">
       <LoginLink>
        <Button>Sign In</Button>
       </LoginLink>
       <RegisterLink>
        <Button variant="secondary">Sign Up</Button>
       </RegisterLink>
      </div>
     )}
    </div>
   </div>
  </nav>
 )
}