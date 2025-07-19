import { toast } from "@/hooks/use-toast";
import { createContact, createOpportunity, debugStageIds } from "@/lib/ghlAPI";

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
    const res = await fetch('http://localhost:5000/api/contacts', {
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
      customField: {
        carexchange: carExchangeValue,
        make: car?.brand || '',
        model: car?.model || '',
        year: car?.manufactureYear?.toString() || '',
        message: payload.message || ''
      },
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
    const res = await fetch('http://localhost:5000/api/test-drives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log('[TestDrive] Backend response:', result);

    // CRM Opportunity integration - v1 API Format (CORRECTED)
    const opportunityPayload = {
      title: `Test Drive Request - ${payload.name}`,
      stageId: "dd4156de-4708-4fdc-b63d-856a8ee7d4ed", 
      status: "open",
      email: payload.email,                              
      phone: payload.phone,                              
      name: payload.name,                               
      tags: ["Website Test Drive"]
    };

    console.log('[TestDrive] About to send to CRM Opportunity:', opportunityPayload);

    try {
      const crmOppResult = await createOpportunity(opportunityPayload);
      console.log('[TestDrive] CRM Opportunity response:', crmOppResult);
      toast({ 
        title: "CRM Opportunity Success", 
        description: "Test drive opportunity sent to CRM successfully." 
      });
    } catch (crmOppError) {
      console.error('[TestDrive] CRM Opportunity Error:', crmOppError);
      toast({ 
        title: "CRM Opportunity Failed", 
        description: "Failed to send test drive opportunity to CRM.", 
        variant: "destructive" 
      });
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



