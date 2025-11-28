import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Settings, CreditCard, LogOut, Crown } from 'lucide-react'

interface UserMenuProps {
  isPro?: boolean
}

export function UserMenu({ isPro = false }: UserMenuProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center gap-3 hover:opacity-80 transition">
          <Avatar className="h-10 w-10 border-2 border-orange-200 cursor-pointer">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
              {user?.email ? getInitials(user.email) : 'U'}
            </AvatarFallback>
          </Avatar>
          {isPro && (
            <div className="absolute -top-1 -right-1 bg-orange-600 rounded-full p-1">
              <Crown className="h-3 w-3 text-white" />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{user?.user_metadata?.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {isPro && (
              <Badge className="bg-orange-100 text-orange-600 border-orange-200 w-fit">
                <Crown className="h-3 w-3 mr-1" />
                Pro Member
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/pricing')} className="cursor-pointer">
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}