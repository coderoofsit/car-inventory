import { toast } from "@/hooks/use-toast";
import { createContact, createOpportunity, debugStageIds } from "@/lib/ghlAPI";
import { pipeline } from "stream";

export const handleContactSubmit = async (formData: any, car?: any) => {
  console.log('[ContactUs] handleContactSubmit called', formData, car);
  if (!formData.name || !formData.email || !formData.phone) {
    toast({
      title: "Missing Information",
      description: "Please fill in all required fields.",
      variant: "destructive"
    });
    return false;
  }
  const carExchangeValue = formData.customField.carExchange ? 'Yes' : 'No';
  const payload = {
    ...formData,
    customField: {
      carexchange: carExchangeValue,
      make: car?.brand || '',
      model: car?.model || '',
      year: car?.manufactureYear?.toString() || '',
      message: formData.message || ''
    }
  };
  console.log('[ContactUs] About to POST to /api/contacts:', payload);
  try {
    const res = await fetch(`${process.env.VITE_BACKEND_URL}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      
    });
    const result = await res.json();
    console.log('[ContactUs] Backend response:', result);
    // CRM integration
    const crmPayload = {
      locationId: "dvLotMiifOU7u2891LNr",
      firstName: payload.name,
      email: payload.email,
      phone: payload.phone,
      customField: [
        {
          "id": "9XZa2jj4XUnh1EQaPHHv", //make
          "fieldValueString":  car?.brand || ''
      },
      {
          "id": "EricJ5qfNkLV7s6Hf9X2", //model
          "fieldValueString": car?.model || ""
      },
      {
          "id": "kaIKPIZtQZUPksovees5", //year
          "fieldValueString": car?.manufactureYear?.toString() || ''
      },
      {
          "id": "JAe1BBAn4dg0kaP2ZCmc", //carexchange
          "fieldValueString": carExchangeValue
      },
      {
          "id": "K7pAe60BBbITbm1cSb5J", //message
          "fieldValueString":  formData.message || ''
      }
      ],
      tags: ["Website Contact"]
    };
    console.log('[ContactUs] About to send to CRM:', crmPayload);
    try {
      const crmResult = await createContact(crmPayload);
      console.log('[ContactUs] CRM response:', crmResult);
      toast({ title: "CRM Success", description: "Contact sent to CRM successfully." });
    } catch (crmError) {
      console.error('[ContactUs] CRM Error:', crmError);
      toast({ title: "CRM Failed", description: "Failed to send contact to CRM.", variant: "destructive" });
    }
    toast({ title: "Message Sent!", description: "We'll contact you soon about this vehicle." });
    return true;
  } catch (err) {
    console.error('[ContactUs] Backend Error:', err);
    toast({
      title: "Backend Error",
      description: "Could not save contact to backend.",
      variant: "destructive"
    });
    return false;
  }
};




export const handleTestDriveSubmit = async (formData: any, car?: any) => {
  if (!formData.name || !formData.email || !formData.phone || !formData.preferredDate) {
    toast({
      title: "Missing Information",
      description: "Please fill in all required fields.",
      variant: "destructive"
    });
    return false;
  }

  const carExchangeValue = formData.customField.carExchange ? 'Yes' : 'No';

  const payload = {
    ...formData,
    customField: {
      carexchange: carExchangeValue,
      make: car?.brand || '',
      model: car?.model || '',
      year: car?.manufactureYear?.toString() || '',
      message: formData.message || ''
    }
  };

  console.log('[TestDrive] About to POST to /api/test-drives:', payload);

  try {
    const res = await fetch(`${process.env.VITE_BACKEND_URL}/api/test-drives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log('[TestDrive] Backend response:', result);

    // Step 1: Create Contact in CRM
    toast({ title: "CRM", description: "Creating contact in CRM..." });
    let contactId = null;
    try {
      const crmContactPayload = {
        locationId: import.meta.env.VITE_GHL_LOCATION_ID,
        firstName: payload.name,
        email: payload.email,
        phone: payload.phone,
        customField: [
          {
            "id": "9XZa2jj4XUnh1EQaPHHv", //make
            "fieldValueString":  car?.brand || ''
        },
        {
            "id": "EricJ5qfNkLV7s6Hf9X2", //model
            "fieldValueString": car?.model || ""
        },
        {
            "id": "kaIKPIZtQZUPksovees5", //year
            "fieldValueString": car?.manufactureYear?.toString() || ''
        },
        {
            "id": "JAe1BBAn4dg0kaP2ZCmc", //carexchange
            "fieldValueString": carExchangeValue
        },
        {
            "id": "K7pAe60BBbITbm1cSb5J", //message
            "fieldValueString":  formData.message || ''
        }
        ],
        tags: ["Website Test Drive"]
        
      };
      const crmContactResult = await createContact(crmContactPayload);
      contactId = crmContactResult.contact?.id || crmContactResult.id;
      if (!contactId) throw new Error('No contactId returned from CRM');
      toast({ title: "CRM Success", description: "Contact created in CRM." });
    } catch (crmError) {
      console.error('[TestDrive] CRM Contact Error:', crmError);
      toast({ title: "CRM Contact Failed", description: "Failed to create contact in CRM.", variant: "destructive" });
      return false;
    }

    // Step 2: Create Opportunity in CRM
    toast({ title: "CRM", description: "Creating opportunity in CRM..." });
    console.log(payload);
    try {
      const opportunityPayload = {
        name: `Test Drive Request - ${payload.name}`,
        status: "open",
        contactId,
        monetaryValue: '', // Optionally fill with price or leave blank
        // The following will be filled from .env in createOpportunity
        customFields: [
          {
              "id": "tNc1XGzGuiub20uLwPCe", //make
              "fieldValueString":  car?.brand || ''
          },
          {
              "id": "LTQztPcGdaNLMd38vGgU", //model
              "fieldValueString": car?.model || ""
          },
          {
              "id": "A1uY67y6tg9UiSmBe10g", //year
              "type": "string",
              "fieldValueString": car?.manufactureYear?.toString() || ''
          },
          {
              "id": "WYkhKcm20G4MobIKAgHz", //carexchange
              "fieldValueString": carExchangeValue
          },
          {
              "id": "JOHWQJGQsy9cuPEzsBHm", //message
              "fieldValueString":  formData.message || ''
          }
      ],
      };
      const crmOppResult = await createOpportunity(opportunityPayload);
      console.log('[TestDrive] CRM Opportunity response:', crmOppResult);
      toast({ title: "CRM Opportunity Success", description: "Test drive opportunity sent to CRM successfully." });
    } catch (crmOppError) {
      console.error('[TestDrive] CRM Opportunity Error:', crmOppError);
      toast({ title: "CRM Opportunity Failed", description: "Failed to send test drive opportunity to CRM.", variant: "destructive" });
      return false;
    }

    toast({
      title: "Test Drive Scheduled!",
      description: "We'll contact you soon to confirm your test drive."
    });
    return true;

  } catch (err) {
    console.error('[TestDrive] Backend Error:', err);
    toast({
      title: "Backend Error",
      description: "Could not save test drive to backend.",
      variant: "destructive"
    });
    return false;
  }
};



