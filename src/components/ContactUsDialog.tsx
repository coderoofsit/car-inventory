import React from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface ContactUsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formState: any;
  setFormState: (form: any) => void;
  onSubmit: (form: any) => Promise<void>;
}

const ContactUsDialog: React.FC<ContactUsDialogProps> = ({ open, onOpenChange, formState, setFormState, onSubmit }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogTitle>Contact Us</DialogTitle>
      <form
        onSubmit={async e => {
          e.preventDefault();
          console.log('[ContactUsDialog] Form submitted');
          await onSubmit(formState);
        }}
        className="space-y-4"
      >
        <Input
          placeholder="Name"
          value={formState.name}
          onChange={e => setFormState({ ...formState, name: e.target.value })}
          required
        />
        <Input
          placeholder="Email"
          value={formState.email}
          onChange={e => setFormState({ ...formState, email: e.target.value })}
          required
        />
        <Input
          placeholder="Phone"
          value={formState.phone}
          onChange={e => setFormState({ ...formState, phone: e.target.value })}
          required
        />
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="carExchange"
            checked={formState.customField.carExchange}
            onChange={e => setFormState({ ...formState, customField: { ...formState.customField, carExchange: e.target.checked } })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="carExchange" className="text-sm font-medium text-gray-700">
            Are you looking to exchange your car?
          </label>
        </div>
        <Textarea
          placeholder="Message"
          value={formState.message}
          onChange={e => setFormState({ ...formState, message: e.target.value })}
        />
        <Button type="submit" className="w-full">Send</Button>
      </form>
    </DialogContent>
  </Dialog>
);

export default ContactUsDialog; 