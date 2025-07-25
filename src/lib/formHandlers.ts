import { toast } from "@/hooks/use-toast";
import { createContact, createOpportunity, debugStageIds } from "@/lib/ghlAPI";
import { pipeline } from "stream";

export const handleContactSubmit = async (formData: any, car?: any, fromTestDrive:boolean = false) => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  //console.log("url for backend= "+BASE_URL)
  //console.log('[ContactUs] handleContactSubmit called', formData, car);
  if (!formData.name || !formData.email || !formData.phone) {
    toast({
      title: "Missing Information",
      description: "Please fill in all required fields.",
      variant: "destructive"
    });
    return false;
  }
  const carExchangeValue = formData.customField.carExchange ? 'Yes' : 'No';
  //console.log('[ContactUs] formData.customField.carid:', formData.customField.carid);
  //console.log('[ContactUs] car?._id:', car?._id);
  const payload = {
    ...formData,
    customField: {
      carexchange: carExchangeValue,
      make: car?.brand || '',
      model: car?.model || '',
      year: car?.manufactureYear?.toString() || '',
      message: formData.message || '',
      carId: formData.customField.carid || ''
    }
  };
  //console.log('[ContactUs] About to POST to /api/contacts:', payload);
  try {
    const res = await fetch(`${BASE_URL}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      
    });
    const result = await res.json();
    //console.log('[ContactUs] Backend response:', result);
    // CRM integration
    const crmPayload = {
      locationId: "dvLotMiifOU7u2891LNr",
      firstName: payload.name,
      email: payload.email,
      phone: payload.phone,
      customField:{
        "9XZa2jj4XUnh1EQaPHHv": car?.brand || '',
        "EricJ5qfNkLV7s6Hf9X2":car?.model || "",
        "kaIKPIZtQZUPksovees5":car?.manufactureYear?.toString() || '',
        "JAe1BBAn4dg0kaP2ZCmc":carExchangeValue,
        "K7pAe60BBbITbm1cSb5J":formData.message || '',
        "JeyMbUzbJqYMeO9KIPTa":formData.customField?.carid || ''
      },
      tags: ["Website Contact"]
    };
    //console.log('[ContactUs] About to send to CRM:', crmPayload);
    try {
      if (!fromTestDrive) {
        const crmResult = await createContact(crmPayload);
      //console.log('[ContactUs] CRM response:', crmResult);
        toast({ title: "CRM Success", description: "Contact sent to CRM successfully." });
      }
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
  const contactResult = await handleContactSubmit(formData, car, true);
  if (!contactResult) {
    return false;
  }
  const carExchangeValue = formData.customField.carExchange ? 'Yes' : 'No';
  //console.log('[TestDrive] formData.customField.carid:', formData.customField.carid);
  //console.log('[TestDrive] car?._id:', car?._id);
  const payload = {
    ...formData,
    customField: {
      carexchange: carExchangeValue,
      make: car?.brand || '',
      model: car?.model || '',
      year: car?.manufactureYear?.toString() || '',
      message: formData.message || '',
      carId: formData.customField.carid || ''
    }
  };

  //console.log('[TestDrive] About to POST to /api/test-drives:', payload);

  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/test-drives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    //console.log('[TestDrive] Backend response:', result);

    // Step 1: Create Contact in CRM
    toast({ title: "CRM", description: "Creating contact in CRM..." });
    let contactId = null;
    try {
      const crmContactPayload = {
        locationId: import.meta.env.VITE_GHL_LOCATION_ID,
        firstName: payload.name,
        email: payload.email,
        phone: payload.phone,
        customField:{
          "9XZa2jj4XUnh1EQaPHHv": car?.brand || '',
          "EricJ5qfNkLV7s6Hf9X2":car?.model || "",
          "kaIKPIZtQZUPksovees5":car?.manufactureYear?.toString() || '',
          "JAe1BBAn4dg0kaP2ZCmc":carExchangeValue,
          "K7pAe60BBbITbm1cSb5J":formData.message || '',
          "JeyMbUzbJqYMeO9KIPTa":formData.customField?.carid || ''
        },
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
    //console.log(payload);
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
              "type": "string",
              "field_value":  car?.brand || ''
          },
          {
              "id": "LTQztPcGdaNLMd38vGgU", //model
              "type": "string",
              "field_value": car?.model || ""
          },
          {
              "id": "A1uY67y6tg9UiSmBe10g", //year
              "type": "string",
              "field_value": car?.manufactureYear?.toString() || ''
          },
          {
              "id": "WYkhKcm20G4MobIKAgHz", //carexchange
              "type": "string",
              "field_value": carExchangeValue
          },
          {
              "id": "JOHWQJGQsy9cuPEzsBHm", //message
              "type": "string",
              "field_value":  formData.message || ''
          },
          {
            "id":"d7tc0S9XGGTDntj6JSEb", //carid
            "type": "string",
            "field_value":formData.customField?.carid || ''
          }
      ],
      };
      const crmOppResult = await createOpportunity(opportunityPayload);
      //console.log('[TestDrive] CRM Opportunity response:', crmOppResult);
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



