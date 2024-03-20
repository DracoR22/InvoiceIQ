'use client'

import { authSchema } from "@/lib/validations/auth"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement>{}

type FormData = z.infer<typeof authSchema>

export function AuthForm({ className, ...props }: AuthFormProps) {
   const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
      resolver: zodResolver(authSchema)
   })
}