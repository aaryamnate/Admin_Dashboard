// ============================================================================
// VYAYAM AI — Centralised TypeScript type definitions
// ============================================================================

// ---- Enums (mirror Prisma enums for client-side use) ----

export enum Role {
  ADMIN = 'ADMIN',
  TRAINER = 'TRAINER',
  CLIENT = 'CLIENT',
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  FROZEN = 'FROZEN',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum ApprovalStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

export enum GymPlan {
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

// ---- Core entity types ----

export interface Gym {
  id: string
  name: string
  slug?: string | null
  ownerId: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  logoUrl?: string | null
  plan: GymPlan | string
  status: string
  createdAt: string
  updatedAt: string
  owner?: User
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  gender?: Gender | null
  dateOfBirth?: string | null
  address?: string | null
  role: Role
  heightCm?: number | null
  weightKg?: number | null
  status: UserStatus
  approvalStatus?: ApprovalStatus | string
  onboardingCompleted?: boolean
  gymId?: string | null
  avatarUrl?: string | null
  specialization?: string | null
  experience?: number | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  gym?: Gym | null
}

export interface UserWithRelations extends User {
  memberships?: Membership[]
  healthMetrics?: HealthMetric[]
  nutritionLogs?: NutritionLog[]
  trainerAllocations?: TrainerAllocation[]
  clientAllocations?: TrainerAllocation[]
}

export interface Membership {
  id: string
  clientId: string
  planName: string
  amount: number
  startDate: string
  endDate: string
  status: MembershipStatus
  notes?: string | null
  createdAt: string
  updatedAt: string
  client?: User
}

export interface TrainerAllocation {
  id: string
  trainerId: string
  clientId: string
  allocatedAt: string
  isActive: boolean
  trainer?: User
  client?: User
}

export interface HealthMetric {
  id: string
  clientId: string
  bmi?: number | null
  weightKg: number
  bloodReportJson?: Record<string, unknown> | null
  notes?: string | null
  recordedAt: string
  client?: User
}

export interface NutritionLog {
  id: string
  clientId: string
  imageUrl?: string | null
  detectedFood?: string | null
  calories: number
  protein: number
  carbs: number
  fats: number
  mealType: MealType
  loggedAt: string
  client?: User
}

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  sentById: string
  createdAt: string
  sentBy?: User
  recipients?: NotificationRecipient[]
}

export interface NotificationRecipient {
  id: string
  notificationId: string
  userId: string
  readAt?: string | null
  user?: User
  notification?: Notification
}

// ---- API response types ----

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  message: string
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: string
}

// ---- Auth types ----

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  confirmPassword?: string
}

export interface AuthResponse {
  user: User
  token: string
  redirectUrl?: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: Role
  name: string
  gymId?: string | null
  onboardingCompleted?: boolean
  approvalStatus?: string
  status?: string
}

// ---- Onboarding types ----

export interface OnboardingData {
  gymName: string
  ownerName: string
  email: string
  phone: string
  address: string
  city: string
  state?: string
  pincode?: string
  plan?: string
  logoUrl?: string
  estimatedMembers?: string
}

// ---- Dashboard types ----

export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  activeMemberships: number
  expiredMemberships: number
  upcomingRenewals: number
  totalTrainers: number
  monthlyRevenue: number
  newMembersThisMonth: number
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

// ---- Form input types ----

export interface CreateMemberInput {
  name: string
  email: string
  password: string
  phone?: string
  gender?: Gender
  dateOfBirth?: string
  address?: string
  heightCm?: number
  weightKg?: number
}

export interface UpdateMemberInput {
  name?: string
  email?: string
  phone?: string
  gender?: Gender
  dateOfBirth?: string
  address?: string
  heightCm?: number
  weightKg?: number
  status?: UserStatus
}

export interface CreateTrainerInput {
  name: string
  email: string
  password: string
  phone?: string
  specialization?: string
  experience?: number
}

export interface UpdateTrainerInput {
  name?: string
  email?: string
  phone?: string
  specialization?: string
  experience?: number
  status?: UserStatus
}

export interface CreateMembershipInput {
  clientId: string
  planName: string
  amount: number
  startDate: string
  endDate: string
}

export interface UpdateMembershipInput {
  status?: MembershipStatus
  endDate?: string
  notes?: string
}

export interface CreateHealthMetricInput {
  clientId: string
  weightKg: number
  bmi?: number
  bloodReportJson?: Record<string, unknown>
  notes?: string
}

export interface CreateNutritionLogInput {
  clientId: string
  detectedFood?: string
  calories: number
  protein: number
  carbs: number
  fats: number
  mealType: MealType
  imageUrl?: string
}

export interface SendNotificationInput {
  title: string
  message: string
  type: string
  recipientIds: string[]
}
