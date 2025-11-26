'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { format, addDays, addHours, addMinutes, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';

interface SchedulingPanelProps {
  scheduledAt?: Date;
  onScheduleChange: (date: Date | undefined) => void;
  status: 'draft' | 'published' | 'scheduled';
  onStatusChange: (status: 'draft' | 'published' | 'scheduled') => void;
  className?: string;
}

const QUICK_SCHEDULE_OPTIONS = [
  { label: 'In 1 hour', getValue: () => addHours(new Date(), 1) },
  { label: 'In 2 hours', getValue: () => addHours(new Date(), 2) },
  { label: 'Tomorrow 9 AM', getValue: () => {
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }},
  { label: 'Next Monday 9 AM', getValue: () => {
    const now = new Date();
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    const nextMonday = addDays(now, daysUntilMonday);
    nextMonday.setHours(9, 0, 0, 0);
    return nextMonday;
  }},
];

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'EST (Eastern Standard Time)' },
  { value: 'America/Chicago', label: 'CST (Central Standard Time)' },
  { value: 'America/Denver', label: 'MST (Mountain Standard Time)' },
  { value: 'America/Los_Angeles', label: 'PST (Pacific Standard Time)' },
  { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)' },
  { value: 'Europe/Paris', label: 'CET (Central European Time)' },
  { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)' },
  { value: 'Asia/Shanghai', label: 'CST (China Standard Time)' },
  { value: 'Australia/Sydney', label: 'AEST (Australian Eastern Time)' },
];

export function SchedulingPanel({
  scheduledAt,
  onScheduleChange,
  status,
  onStatusChange,
  className
}: SchedulingPanelProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(scheduledAt);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('UTC');
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Initialize time from scheduledAt
  useEffect(() => {
    if (scheduledAt) {
      setSelectedDate(scheduledAt);
      setSelectedTime(format(scheduledAt, 'HH:mm'));
    }
  }, [scheduledAt]);

  // Update scheduledAt when date or time changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      
      if (newDate.getTime() !== scheduledAt?.getTime()) {
        onScheduleChange(newDate);
      }
    }
  }, [selectedDate, selectedTime, scheduledAt, onScheduleChange]);

  const handleQuickSchedule = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(format(date, 'HH:mm'));
    onScheduleChange(date);
    onStatusChange('scheduled');
  };

  const handleClearSchedule = () => {
    setSelectedDate(undefined);
    setSelectedTime('');
    onScheduleChange(undefined);
    onStatusChange('draft');
  };

  const handlePublishNow = () => {
    onScheduleChange(undefined);
    onStatusChange('published');
  };

  const isValidScheduleTime = (date: Date) => {
    const now = new Date();
    return isAfter(date, addMinutes(now, 5)); // Must be at least 5 minutes in the future
  };

  const getScheduleStatus = () => {
    if (!scheduledAt) return null;
    
    const now = new Date();
    const isValid = isValidScheduleTime(scheduledAt);
    
    if (isBefore(scheduledAt, now)) {
      return {
        type: 'error' as const,
        message: 'Scheduled time is in the past'
      };
    }
    
    if (!isValid) {
      return {
        type: 'warning' as const,
        message: 'Schedule time must be at least 5 minutes in the future'
      };
    }
    
    return {
      type: 'success' as const,
      message: `Will be published ${format(scheduledAt, 'PPP p')}`
    };
  };

  const scheduleStatus = getScheduleStatus();

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Publishing Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Selection */}
        <div className="space-y-3">
          <Label>Publication Status</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={status === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange('draft')}
              className="w-full"
            >
              Draft
            </Button>
            <Button
              variant={status === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={handlePublishNow}
              className="w-full"
            >
              Publish Now
            </Button>
            <Button
              variant={status === 'scheduled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange('scheduled')}
              className="w-full"
            >
              Schedule
            </Button>
          </div>
        </div>

        {/* Quick Schedule Options */}
        {status === 'scheduled' && (
          <div className="space-y-3">
            <Label>Quick Schedule</Label>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_SCHEDULE_OPTIONS.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSchedule(option.getValue())}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Schedule */}
        {status === 'scheduled' && (
          <div className="space-y-4">
            <Label>Custom Schedule</Label>
            
            {/* Date Picker */}
            <div className="space-y-2">
              <Label className="text-sm">Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => isBefore(date, new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div className="space-y-2">
              <Label className="text-sm">Time</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule Status */}
            {scheduleStatus && (
              <div className={cn(
                'flex items-center gap-2 p-3 rounded-lg text-sm',
                scheduleStatus.type === 'success' && 'bg-green-50 text-green-700 border border-green-200',
                scheduleStatus.type === 'warning' && 'bg-yellow-50 text-yellow-700 border border-yellow-200',
                scheduleStatus.type === 'error' && 'bg-red-50 text-red-700 border border-red-200'
              )}>
                {scheduleStatus.type === 'success' && <CheckCircle className="h-4 w-4" />}
                {scheduleStatus.type === 'warning' && <AlertCircle className="h-4 w-4" />}
                {scheduleStatus.type === 'error' && <AlertCircle className="h-4 w-4" />}
                {scheduleStatus.message}
              </div>
            )}

            {/* Clear Schedule */}
            {scheduledAt && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSchedule}
                className="w-full text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Schedule
              </Button>
            )}
          </div>
        )}

        {/* Current Schedule Display */}
        {status === 'scheduled' && scheduledAt && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Scheduled for:</p>
                <p className="text-sm text-muted-foreground">
                  {format(scheduledAt, 'PPP p')} ({timezone})
                </p>
              </div>
              <Badge variant="secondary">
                Scheduled
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}