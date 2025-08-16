"use client";
import React from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { X } from "lucide-react";

const EditHorseModal = ({ state, onChange, onClose, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Horse Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="surpriseHorseName">Surprise Horse Name</Label>
            <Input
              id="surpriseHorseName"
              value={state.surpriseHorseName}
              onChange={(e) => onChange((s) => ({ ...s, surpriseHorseName: e.target.value }))}
              placeholder="Enter surprise horse name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="activeHorse">Active Horse</Label>
            <Select
              value={state.activeHorse}
              onValueChange={(value) => onChange((s) => ({ ...s, activeHorse: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select active horse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Main Horse</SelectItem>
                <SelectItem value="surprise">Surprise Horse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} type="button" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHorseModal;
