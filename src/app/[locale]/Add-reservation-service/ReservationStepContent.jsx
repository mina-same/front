import React from 'react';
import { motion } from "framer-motion";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Calendar } from "../../../components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui new/popover";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { cn } from "../../../lib/utils";



const ReservationStepContent= ({
  step,
  animateDirection,
  service,
  formData,
  errors,
  handleChange,
  userHorses,
  journeys,
  totalPrice
}) => {
  const variants = {
    enter: (direction) => ({
      x: direction === "next" ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction === "next" ? -1000 : 1000,
      opacity: 0
    })
  };

  const renderServiceDetails = () => {
    if (!service) return null;
    
    const { service_type } = service;
    
    return (
      <motion.div
        key={`step-${step}`}
        custom={animateDirection}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 }
        }}
        className="space-y-6"
      >
        <div className="p-4 border border-gray-100 bg-gray-50 rounded-lg mb-6">
          <h3 className="font-semibold">{service.name_en}</h3>
          <p className="text-muted-foreground text-sm">
            {service.price} per {service.priceUnit.replace(/_/g, ' ')}
          </p>
        </div>
        
        {/* Horse selection for relevant service types */}
        {['horse_stable'].includes(service_type) && (
          <div className="space-y-4">
            <Label htmlFor="horses">Select Horses</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userHorses.map(horse => (
                <div
                  key={horse._id}
                  className={cn(
                    "border rounded-lg p-3 cursor-pointer transition-all",
                    formData.horses.some((h) => h._id === horse._id)
                      ? "border-gold bg-gold/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => {
                    const isSelected = formData.horses.some((h) => h._id === horse._id);
                    let newHorses;
                    
                    if (isSelected) {
                      newHorses = formData.horses.filter((h) => h._id !== horse._id);
                    } else {
                      newHorses = [...formData.horses, horse];
                    }
                    
                    handleChange('horses', newHorses);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={formData.horses.some((h) => h._id === horse._id)}
                      onCheckedChange={(checked) => {
                        const isChecked = !!checked;
                        let newHorses;
                        
                        if (isChecked) {
                          newHorses = [...formData.horses, horse];
                        } else {
                          newHorses = formData.horses.filter((h) => h._id !== horse._id);
                        }
                        
                        handleChange('horses', newHorses);
                      }}
                    />
                    <div>
                      <p className="font-medium">{horse.name}</p>
                      <p className="text-sm text-gray-500">
                        {horse.breed}, {horse.age} years
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.horses && (
              <p className="text-destructive text-sm">{errors.horses}</p>
            )}
          </div>
        )}
        
        {/* Single horse selection for relevant service types */}
        {['veterinary', 'horse_catering', 'horse_transport', 'hoof_trimmer', 'horse_grooming', 'horse_trainer'].includes(service_type) && (
          <div className="space-y-4">
            <Label htmlFor="horse">Select Horse</Label>
            <Select
              value={formData.horse?._id || ""}
              onValueChange={(value) => {
                const selectedHorse = userHorses.find(h => h._id === value);
                handleChange('horse', selectedHorse || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a horse" />
              </SelectTrigger>
              <SelectContent>
                {userHorses.map(horse => (
                  <SelectItem key={horse._id} value={horse._id}>
                    {horse.name} - {horse.breed}, {horse.age} years
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.horse && (
              <p className="text-destructive text-sm">{errors.horse}</p>
            )}
          </div>
        )}
        
        {/* Competition details */}
        {service_type === 'competitions' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="competitionType">Competition Type</Label>
              <Select
                value={formData.eventDetails.competitionType}
                onValueChange={(value) => handleChange('eventDetails.competitionType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select competition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="show_jumping">Show Jumping</SelectItem>
                  <SelectItem value="dressage">Dressage</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                </SelectContent>
              </Select>
              {errors.competitionType && (
                <p className="text-destructive text-sm">{errors.competitionType}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="participantInfo">Participant Information</Label>
              <Textarea
                id="participantInfo"
                placeholder="Enter details about participants"
                value={formData.eventDetails.participantInfo}
                onChange={(e) => handleChange('eventDetails.participantInfo', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
        )}
        
        {/* Trip coordinator details */}
        {service_type === 'trip_coordinator' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="journeyRef">Select Journey</Label>
              <Select
                value={formData.tripDetails.journeyRef}
                onValueChange={(value) => handleChange('tripDetails.journeyRef', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a journey" />
                </SelectTrigger>
                <SelectContent>
                  {journeys.map(journey => (
                    <SelectItem key={journey._id} value={journey._id}>
                      {journey.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.journeyRef && (
                <p className="text-destructive text-sm">{errors.journeyRef}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="numberOfParticipants">Number of Participants</Label>
              <Input
                id="numberOfParticipants"
                type="number"
                min="1"
                value={formData.tripDetails.numberOfParticipants}
                onChange={(e) => handleChange('tripDetails.numberOfParticipants', parseInt(e.target.value) || 1)}
              />
              {errors.numberOfParticipants && (
                <p className="text-destructive text-sm">{errors.numberOfParticipants}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Project-based service details */}
        {['photography_services', 'consulting_services', 'marketing_promotion', 'event_commentary', 'event_judging', 'contractors'].includes(service_type) && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectDescription">Project Description</Label>
              <Textarea
                id="projectDescription"
                placeholder="Describe your project requirements in detail"
                value={formData.projectDetails.description}
                onChange={(e) => handleChange('projectDetails.description', e.target.value)}
                className="min-h-[150px]"
              />
              {errors.projectDescription && (
                <p className="text-destructive text-sm">{errors.projectDescription}</p>
              )}
            </div>
            
            {service_type === 'photography_services' && (
              <div>
                <Label htmlFor="locationLink">Location Link</Label>
                <Input
                  id="locationLink"
                  type="text"
                  placeholder="Enter location link or address"
                  value={formData.locationLink}
                  onChange={(e) => handleChange('locationLink', e.target.value)}
                />
                {errors.locationLink && (
                  <p className="text-destructive text-sm">{errors.locationLink}</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Housing details */}
        {service_type === 'housing' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="numberOfGuests">Number of Guests</Label>
              <Input
                id="numberOfGuests"
                type="number"
                min="1"
                value={formData.housingDetails.numberOfGuests}
                onChange={(e) => handleChange('housingDetails.numberOfGuests', parseInt(e.target.value) || 1)}
              />
              {errors.numberOfGuests && (
                <p className="text-destructive text-sm">{errors.numberOfGuests}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="accommodationType">Accommodation Type</Label>
              <Select
                value={formData.housingDetails.accommodationType}
                onValueChange={(value) => handleChange('housingDetails.accommodationType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select accommodation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moving_housing">Moving Housing</SelectItem>
                  <SelectItem value="caravan">Caravan</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                </SelectContent>
              </Select>
              {errors.accommodationType && (
                <p className="text-destructive text-sm">{errors.accommodationType}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Transport locations */}
        {service_type === 'horse_transport' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="startLocation">Start Location</Label>
              <Input
                id="startLocation"
                type="text"
                placeholder="Enter start location"
                value={formData.locations.startLocation || ""}
                onChange={(e) => handleChange('locations.startLocation', e.target.value)}
              />
              {errors.startLocation && (
                <p className="text-destructive text-sm">{errors.startLocation}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="endLocation">End Location</Label>
              <Input
                id="endLocation"
                type="text"
                placeholder="Enter end location"
                value={formData.locations.endLocation || ""}
                onChange={(e) => handleChange('locations.endLocation', e.target.value)}
              />
              {errors.endLocation && (
                <p className="text-destructive text-sm">{errors.endLocation}</p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderDateTimeFields = () => {
    // Show date fields based on price unit and service type
    const showStartEndDates = ['per_day', 'per_hour', 'per_half_hour'].includes(service.priceUnit) &&
      !['horse_catering', 'trip_coordinator'].includes(service.service_type);
    
    const showEventDate = ['photography_services', 'consulting_services', 'marketing_promotion',
      'event_commentary', 'event_judging', 'competitions', 'contractors'].includes(service.service_type);
    
    return (
      <motion.div
        key={`step-${step}`}
        custom={animateDirection}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 }
        }}
        className="space-y-6"
      >
        {showStartEndDates && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date & Time</Label>
                <div className="grid grid-cols-5 gap-2">
                  {/* Start Date picker */}
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(new Date(formData.startDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.startDate ? new Date(formData.startDate) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              // Preserve the time if already set
                              const currentDate = formData.startDate ? new Date(formData.startDate) : new Date();
                              date.setHours(currentDate.getHours(), currentDate.getMinutes());
                              handleChange('startDate', date.toISOString());
                            } else {
                              handleChange('startDate', null);
                            }
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Start Time */}
                  <div className="col-span-2">
                    <Select
                      value={formData.startDate 
                        ? `${new Date(formData.startDate).getHours()}:${new Date(formData.startDate).getMinutes() < 10 ? '0' : ''}${new Date(formData.startDate).getMinutes()}`
                        : ""}
                      onValueChange={(timeStr) => {
                        if (formData.startDate && timeStr) {
                          const [hours, minutes] = timeStr.split(':').map(Number);
                          const date = new Date(formData.startDate);
                          date.setHours(hours, minutes);
                          handleChange('startDate', date.toISOString());
                        }
                      }}
                      disabled={!formData.startDate}
                    >
                      <SelectTrigger>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Time" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, hour) => {
                          return [0, 30].map(minute => {
                            const timeStr = `${hour}:${minute === 0 ? '00' : minute}`;
                            const display = format(new Date().setHours(hour, minute), 'h:mm a');
                            return (
                              <SelectItem key={timeStr} value={timeStr}>
                                {display}
                              </SelectItem>
                            );
                          });
                        }).flat()}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {errors.startDate && (
                  <p className="text-destructive text-sm">{errors.startDate}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time</Label>
                <div className="grid grid-cols-5 gap-2">
                  {/* End Date picker */}
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? format(new Date(formData.endDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.endDate ? new Date(formData.endDate) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              // Preserve the time if already set
                              const currentDate = formData.endDate ? new Date(formData.endDate) : new Date();
                              date.setHours(currentDate.getHours(), currentDate.getMinutes());
                              handleChange('endDate', date.toISOString());
                            } else {
                              handleChange('endDate', null);
                            }
                          }}
                          disabled={(date) => {
                            const startDate = formData.startDate ? new Date(formData.startDate) : null;
                            return date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                                  (startDate && date < new Date(startDate.setHours(0, 0, 0, 0)));
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* End Time */}
                  <div className="col-span-2">
                    <Select
                      value={formData.endDate 
                        ? `${new Date(formData.endDate).getHours()}:${new Date(formData.endDate).getMinutes() < 10 ? '0' : ''}${new Date(formData.endDate).getMinutes()}`
                        : ""}
                      onValueChange={(timeStr) => {
                        if (formData.endDate && timeStr) {
                          const [hours, minutes] = timeStr.split(':').map(Number);
                          const date = new Date(formData.endDate);
                          date.setHours(hours, minutes);
                          handleChange('endDate', date.toISOString());
                        }
                      }}
                      disabled={!formData.endDate}
                    >
                      <SelectTrigger>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Time" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, hour) => {
                          return [0, 30].map(minute => {
                            const timeStr = `${hour}:${minute === 0 ? '00' : minute}`;
                            const display = format(new Date().setHours(hour, minute), 'h:mm a');
                            return (
                              <SelectItem key={timeStr} value={timeStr}>
                                {display}
                              </SelectItem>
                            );
                          });
                        }).flat()}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {errors.endDate && (
                  <p className="text-destructive text-sm">{errors.endDate}</p>
                )}
              </div>
            </div>
            
            <div className="p-4 rounded-md bg-blue-50 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 mt-1">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">Duration Pricing</h3>
                  <p className="text-sm text-blue-700">
                    This service is priced per {service.priceUnit.replace(/_/g, ' ')}. The total price will be calculated based on the duration.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {showEventDate && (
          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date & Time</Label>
            <div className="grid grid-cols-5 gap-2">
              {/* Event Date picker */}
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.eventDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.eventDate ? format(new Date(formData.eventDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.eventDate ? new Date(formData.eventDate) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Preserve the time if already set
                          const currentDate = formData.eventDate ? new Date(formData.eventDate) : new Date();
                          date.setHours(currentDate.getHours(), currentDate.getMinutes());
                          handleChange('eventDate', date.toISOString());
                        } else {
                          handleChange('eventDate', null);
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Event Time */}
              <div className="col-span-2">
                <Select
                  value={formData.eventDate 
                    ? `${new Date(formData.eventDate).getHours()}:${new Date(formData.eventDate).getMinutes() < 10 ? '0' : ''}${new Date(formData.eventDate).getMinutes()}`
                    : ""}
                  onValueChange={(timeStr) => {
                    if (formData.eventDate && timeStr) {
                      const [hours, minutes] = timeStr.split(':').map(Number);
                      const date = new Date(formData.eventDate);
                      date.setHours(hours, minutes);
                      handleChange('eventDate', date.toISOString());
                    }
                  }}
                  disabled={!formData.eventDate}
                >
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Time" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, hour) => {
                      return [0, 30].map(minute => {
                        const timeStr = `${hour}:${minute === 0 ? '00' : minute}`;
                        const display = format(new Date().setHours(hour, minute), 'h:mm a');
                        return (
                          <SelectItem key={timeStr} value={timeStr}>
                            {display}
                          </SelectItem>
                        );
                      });
                    }).flat()}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {errors.eventDate && (
              <p className="text-destructive text-sm">{errors.eventDate}</p>
            )}
          </div>
        )}
        
        <div className="pt-4">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any special requests or instructions you'd like to include"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      </motion.div>
    );
  };

  const renderAdditionalOptions = () => {
    // Get additionalBenefits options based on service type
    const getAdditionalBenefitsOptions = () => {
      switch (service.service_type) {
        case 'veterinary':
          return [
            { id: 'examination', name_ar: 'الفحص البيطري', name_en: 'Veterinary Examination', additional_price: 50 },
            { id: 'vaccination', name_ar: 'التطعيم', name_en: 'Vaccination', additional_price: 75 },
            { id: 'go_to_horse', name_ar: 'الذهاب إلى منزل الحصان', name_en: 'Go to Horse Home', additional_price: 100 }
          ];
        case 'horse_grooming':
          return [
            { id: 'mane_trim', name_ar: 'قص الأخدود', name_en: 'Mane Trim', additional_price: 30 },
            { id: 'full_bath', name_ar: 'حمام كامل', name_en: 'Full Bath', additional_price: 45 },
            { id: 'hoof_polish', name_ar: 'تلميع الحافر', name_en: 'Hoof Polish', additional_price: 25 },
            { id: 'go_to_horse', name_ar: 'الذهاب إلى منزل الحصان', name_en: 'Go to Horse Home', additional_price: 80 }
          ];
        case 'hoof_trimmer':
          return [
            { id: 'standard_trim', name_ar: 'تقليم قياسي', name_en: 'Standard Trim', additional_price: 60 },
            { id: 'specialty_shoes', name_ar: 'حذاء متخصص', name_en: 'Specialty Shoes', additional_price: 120 },
            { id: 'go_to_horse', name_ar: 'الذهاب إلى منزل الحصان', name_en: 'Go to Horse Home', additional_price: 90 }
          ];
        case 'horse_stable':
          return [
            { id: 'daily_exercise', name_ar: 'تمرين يومي', name_en: 'Daily Exercise', additional_price: 35 },
            { id: 'premium_feed', name_ar: 'تغذية متميزة', name_en: 'Premium Feed', additional_price: 40 },
            { id: 'grooming', name_ar: 'العناية', name_en: 'Grooming', additional_price: 25 }
          ];
        case 'horse_catering':
          return [
            { id: 'special_diet', name_ar: 'نظام غذائي خاص', name_en: 'Special Diet Plan', additional_price: 55 },
            { id: 'supplements', name_ar: 'المكملات الغذائية', name_en: 'Supplements', additional_price: 40 }
          ];
        case 'horse_transport':
          return [
            { id: 'climate_control', name_ar: 'التحكم في المناخ', name_en: 'Climate Control', additional_price: 65 },
            { id: 'overnight_stop', name_ar: 'توقف ليلي', name_en: 'Overnight Stop', additional_price: 120 }
          ];
        case 'housing':
          return [
            { id: 'daily_cleaning', name_ar: 'تنظيف يومي', name_en: 'Daily Cleaning', additional_price: 40 },
            { id: 'premium_bedding', name_ar: 'فراش متميز', name_en: 'Premium Bedding', additional_price: 35 }
          ];
        case 'horse_trainer':
          return [
            { id: 'specialized_training', name_ar: 'تدريب متخصص', name_en: 'Specialized Training', additional_price: 90 },
            { id: 'behavior_correction', name_ar: 'تصحيح السلوك', name_en: 'Behavior Correction', additional_price: 75 }
          ];
        case 'trip_coordinator':
          return [
            { id: 'premium_meals', name_ar: 'وجبات متميزة', name_en: 'Premium Meals', additional_price: 50 },
            { id: 'guided_tours', name_ar: 'جولات مع مرشد', name_en: 'Guided Tours', additional_price: 70 }
          ];
        default:
          return [];
      }
    };
    
    const additionalBenefitsOptions = getAdditionalBenefitsOptions();
    const showAdditionalBenefits = additionalBenefitsOptions.length > 0;
    
    // Determine if this service type may need address input
    const mayNeedAddress = ['veterinary', 'hoof_trimmer', 'horse_grooming'].includes(service.service_type);
    const hasGoToHomeOption = formData.additionalBenefits.some((benefit) => 
      benefit.name_en?.toLowerCase().includes('go to') || 
      benefit.name_ar?.includes('الذهاب')
    );
    
    return (
      <motion.div
        key={`step-${step}`}
        custom={animateDirection}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 }
        }}
        className="space-y-6"
      >
        {showAdditionalBenefits && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Services</h3>
            <p className="text-muted-foreground">Select any additional services you would like to add</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {additionalBenefitsOptions.map(benefit => {
                const isSelected = formData.additionalBenefits.some((b) => b.id === benefit.id);
                
                return (
                  <div 
                    key={benefit.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-all",
                      isSelected
                        ? "border-gold bg-gold/5"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => {
                      let newBenefits;
                      
                      if (isSelected) {
                        newBenefits = formData.additionalBenefits.filter((b) => b.id !== benefit.id);
                      } else {
                        newBenefits = [...formData.additionalBenefits, benefit];
                      }
                      
                      handleChange('additionalBenefits', newBenefits);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              let newBenefits;
                              
                              if (checked) {
                                newBenefits = [...formData.additionalBenefits, benefit];
                              } else {
                                newBenefits = formData.additionalBenefits.filter((b) => b.id !== benefit.id);
                              }
                              
                              handleChange('additionalBenefits', newBenefits);
                            }}
                          />
                          <span className="font-medium">{benefit.name_en}</span>
                        </div>
                        <div className="ml-6 text-sm text-muted-foreground">{benefit.name_ar}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${benefit.additional_price}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {mayNeedAddress && hasGoToHomeOption && (
          <div className="space-y-2 p-4 border border-gray-200 rounded-lg">
            <Label htmlFor="providedAddress">Your Address</Label>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-400 mt-2" />
              <Input
                id="providedAddress"
                placeholder="Enter your address for on-site service"
                value={formData.providedAddress}
                onChange={(e) => handleChange('providedAddress', e.target.value)}
              />
            </div>
            {errors.providedAddress && (
              <p className="text-destructive text-sm">{errors.providedAddress}</p>
            )}
          </div>
        )}
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Price Summary</h3>
            <div>
              <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          {formData.additionalBenefits.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Additional Services:</h4>
              <ul className="space-y-2">
                {formData.additionalBenefits.map((benefit) => (
                  <li key={benefit.id} className="flex justify-between text-sm">
                    <span>{benefit.name_en}</span>
                    <span>${benefit.additional_price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  switch (step) {
    case 1:
      return renderServiceDetails();
    case 2:
      return renderDateTimeFields();
    case 3:
      return renderAdditionalOptions();
    default:
      return null;
  }
};

export default ReservationStepContent;