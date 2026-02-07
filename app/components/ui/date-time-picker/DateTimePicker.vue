<script setup lang="ts">
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock } from 'lucide-vue-next'
import {
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
    today,
    parseDate,
    CalendarDate,
    CalendarDateTime,
    toCalendarDate,
    toCalendarDateTime,
} from '@internationalized/date'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
    placeholder?: string
    label?: string
    required?: boolean
}>()

const date = defineModel<Date | undefined>({ required: false })

const isOpen = ref(false)

// Internal state for calendar (DateValue)
const calendarDate = ref<DateValue | undefined>(undefined)
const timeValue = ref('12:00')

// Initialize internal state from modelValue
watch(date, (newDate) => {
    if (newDate) {
        const d = new Date(newDate)
        const year = d.getFullYear()
        const month = d.getMonth() + 1
        const day = d.getDate()
        calendarDate.value = new CalendarDate(year, month, day)

        const hours = d.getHours().toString().padStart(2, '0')
        const minutes = d.getMinutes().toString().padStart(2, '0')
        timeValue.value = `${hours}:${minutes}`
    } else {
        calendarDate.value = undefined
        timeValue.value = '12:00'
    }
}, { immediate: true })

// Update modelValue when calendar or time changes
const updateDate = (newDate: DateValue | undefined) => {
    if (!newDate) {
        date.value = undefined
        return
    }

    calendarDate.value = newDate

    const parts = timeValue.value.split(':')
    const hours = parseInt(parts[0] || '0', 10)
    const minutes = parseInt(parts[1] || '0', 10)

    const jsDate = newDate.toDate(getLocalTimeZone())
    jsDate.setHours(hours, minutes)
    date.value = jsDate
}

const updateTime = (newTime: string) => {
    timeValue.value = newTime
    if (calendarDate.value) {
        updateDate(calendarDate.value as any)
    }
}

// Generate time options (every 30 mins)
const timeOptions = computed(() => {
    const options = []
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 30) {
            const hour = i.toString().padStart(2, '0')
            const minute = j.toString().padStart(2, '0')
            options.push(`${hour}:${minute}`)
        }
    }
    return options
})

const contentRef = ref<HTMLElement | null>(null)

const handleCloseOnOutside = (e: CustomEvent) => {
    const target = e.detail.originalEvent.target as HTMLElement
    if (contentRef.value && !contentRef.value.contains(target)) {
        isOpen.value = false
    }
}

const df = new DateFormatter('en-US', {
    dateStyle: 'long',
})
</script>

<template>
    <div class="grid gap-2">
        <label v-if="label"
            class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 flex justify-between">
            {{ label }}
            <span v-if="required" class="text-[10px] text-slate-600">REQ*</span>
        </label>
        <Popover v-model:open="isOpen">
            <PopoverTrigger as-child>
                <Button variant="outline" :class="cn(
                    'w-full justify-start text-left font-normal bg-black/60 border-slate-700 hover:bg-slate-900/50 hover:text-white h-12',
                    !date && 'text-muted-foreground'
                )">
                    <CalendarIcon class="mr-2 h-4 w-4 text-secondary" />
                    <span v-if="date" class="font-display tracking-wide">
                        {{ format(date, 'MMM d, yyyy') }} at {{ timeValue }}
                    </span>
                    <span v-else class="text-slate-500 italic">{{ placeholder || "Pick a date" }}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0 bg-slate-950 border-slate-800" align="start">
                <div ref="contentRef">
                    <div class="p-3 border-b border-slate-800">
                        <div class="text-xs font-medium text-center text-slate-400 mb-2 uppercase tracking-wider">Select
                            Date & Time</div>
                        <div class="flex gap-2">
                            <Select v-model="timeValue" @update:modelValue="(v) => updateTime(v as string)">
                                <SelectTrigger class="w-full bg-slate-900 border-slate-700 h-8 text-xs">
                                    <SelectValue placeholder="Time" />
                                </SelectTrigger>
                                <SelectContent class="bg-slate-950 border-slate-800 max-h-[200px]"
                                    @pointer-down-outside="handleCloseOnOutside">
                                    <SelectItem v-for="time in timeOptions" :key="time" :value="time"
                                        class="text-xs focus:bg-slate-800 focus:text-white">
                                        {{ time }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Calendar :model-value="calendarDate as any" initial-focus @update:model-value="updateDate"
                        class="p-3" />
                </div>
            </PopoverContent>
        </Popover>
    </div>
</template>
