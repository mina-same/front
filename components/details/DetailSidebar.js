"use client";

import { useState } from "react";
import { Button } from "../../src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../src/components/ui/card";
import { Separator } from "../../src/components/ui new/separator";
import { Mail, Phone, User } from "lucide-react";

export default function DetailSidebar({ price, contactInfo, onEnroll, actionLabel = "Enroll Now", isLoading = false }) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Registration</span>
          {typeof price === "number" && <span className="text-2xl font-bold">${price}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={onEnroll} className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            actionLabel
          )}
        </Button>

        {contactInfo && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Contact Information</h4>
              {contactInfo.name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>{contactInfo.name}</span>
                </div>
              )}
              {contactInfo.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${contactInfo.email}`} className="hover:underline">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${contactInfo.phone}`} className="hover:underline">
                    {contactInfo.phone}
                  </a>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}