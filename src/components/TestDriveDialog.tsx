import React from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface TestDriveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formState: any;
  setFormState: (form: any) => void;
  onSubmit: (form: any) => Promise<void>;
}

const TestDriveDialog: React.FC<TestDriveDialogProps> = ({ open, onOpenChange, formState, setFormState, onSubmit }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogTitle>Book a Test Drive</DialogTitle>
      <form
        onSubmit={async e => {
          e.preventDefault();
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
        <Input
          placeholder="Preferred Date"
          type="date"
          value={formState.preferredDate}
          onChange={e => setFormState({ ...formState, preferredDate: e.target.value })}
          required
        />
        <Input
          placeholder="Preferred Time"
          type="time"
          value={formState.preferredTime}
          onChange={e => setFormState({ ...formState, preferredTime: e.target.value })}
        />
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="testDriveCarExchange"
            checked={formState.customField.carExchange}
            onChange={e => setFormState({ ...formState, customField: { ...formState.customField, carExchange: e.target.checked } })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="testDriveCarExchange" className="text-sm font-medium text-gray-700">
            Are you looking to exchange your car?
          </label>
        </div>
        <Textarea
          placeholder="Message"
          value={formState.message}
          onChange={e => setFormState({ ...formState, message: e.target.value })}
        />
        <Button type="submit" className="w-full">Book Test Drive</Button>
      </form>
    </DialogContent>
  </Dialog>
);

export default TestDriveDialog; 