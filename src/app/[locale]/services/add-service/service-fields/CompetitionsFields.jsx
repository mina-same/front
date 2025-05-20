import React from 'react';
import { Input } from '@/components/ui/input';

const CompetitionsFields = ({
  formData,
  handleNestedChange,
  handleChange,
  errors,
  isRTL
}) => {
  // Make sure we're working with a properly initialized competitions object
  React.useEffect(() => {
    if (!formData.service_details.competitions) {
      handleNestedChange('competitions', '', {});
    }
  }, [formData.service_details.competitions, handleNestedChange]);

  const competitionsDetails = formData.service_details.competitions || {};
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="level">
            Level
          </label>
          <select
            id="level"
            value={competitionsDetails.level || ''}
            onChange={(e) => handleNestedChange('competitions', 'level', e.target.value)}
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="raceType">
            Race Type
          </label>
          <select
            id="raceType"
            value={competitionsDetails.raceType || ''}
            onChange={(e) => handleNestedChange('competitions', 'raceType', e.target.value)}
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          >
            <option value="">Select Race Type</option>
            <option value="endurance_race">Endurance Race</option>
            <option value="shooting_arrows">Shooting Arrows</option>
            <option value="pickup_pegs">Pickup Pegs</option>
            <option value="dressage">Dressage</option>
          </select>
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="heightDistance">
          Height/Distance
        </label>
        <Input
          id="heightDistance"
          value={competitionsDetails.heightDistance || ''}
          onChange={(e) => handleNestedChange('competitions', 'heightDistance', e.target.value)}
          placeholder="Enter height or distance specification"
          className="w-full border-2 rounded-xl p-3 border-gray-300"
        />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="organiserName">
          Organiser Name
        </label>
        <Input
          id="organiserName"
          value={competitionsDetails.organiserName || ''}
          onChange={(e) => handleNestedChange('competitions', 'organiserName', e.target.value)}
          placeholder="Enter organiser name"
          className="w-full border-2 rounded-xl p-3 border-gray-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="mainReferee">
            Main Referee
          </label>
          <Input
            id="mainReferee"
            value={competitionsDetails.mainReferee || ''}
            onChange={(e) => handleNestedChange('competitions', 'mainReferee', e.target.value)}
            placeholder="Enter main referee name"
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="coReferee1">
            Co-Referee 1
          </label>
          <Input
            id="coReferee1"
            value={competitionsDetails.coReferee1 || ''}
            onChange={(e) => handleNestedChange('competitions', 'coReferee1', e.target.value)}
            placeholder="Enter co-referee 1 name"
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="coReferee2">
            Co-Referee 2
          </label>
          <Input
            id="coReferee2"
            value={competitionsDetails.coReferee2 || ''}
            onChange={(e) => handleNestedChange('competitions', 'coReferee2', e.target.value)}
            placeholder="Enter co-referee 2 name"
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="prize">
            Prize
          </label>
          <Input
            id="prize"
            value={competitionsDetails.prize || ''}
            onChange={(e) => handleNestedChange('competitions', 'prize', e.target.value)}
            placeholder="Enter prize details"
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="sponsor">
            Sponsor
          </label>
          <Input
            id="sponsor"
            value={competitionsDetails.sponsor || ''}
            onChange={(e) => handleNestedChange('competitions', 'sponsor', e.target.value)}
            placeholder="Enter sponsor name"
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          />
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="sponsorLogo">
          Sponsor Logo
        </label>
        <Input
          type="file"
          id="sponsorLogo"
          onChange={handleChange}
          accept="image/*"
          className="w-full border-2 rounded-xl p-3 border-gray-300"
        />
        <p className="text-xs text-gray-500 mt-1">
          Accepted formats: JPG, PNG, GIF
        </p>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="sponsorshipValue">
          Sponsorship Value
        </label>
        <Input
          type="number"
          id="sponsorshipValue"
          value={competitionsDetails.sponsorshipValue || ''}
          onChange={(e) => handleNestedChange('competitions', 'sponsorshipValue', e.target.value)}
          placeholder="0.00"
          className="w-full border-2 rounded-xl p-3 border-gray-300"
        />
      </div>
    </div>
  );
};

export default CompetitionsFields;