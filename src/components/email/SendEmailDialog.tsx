import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Mail, Send } from 'lucide-react';

interface SendEmailDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  recipientEmail?: string;
  recipientName?: string;
}

export default function SendEmailDialog({ 
  isOpen = false, 
  onOpenChange = () => {}, 
  recipientEmail = "",
  recipientName = ""
}: SendEmailDialogProps) {
  const [formData, setFormData] = useState({
    to: recipientEmail,
    subject: '',
    message: '',
    template: 'custom'
  });
  const [sending, setSending] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTemplateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      template: value
    }));

    // Set predefined content based on template
    switch (value) {
      case 'welcome':
        setFormData(prev => ({
          ...prev,
          subject: 'Bienvenido a nuestra franquicia',
          message: `Hola ${recipientName || 'estimado/a cliente'},\n\nGracias por tu interés en nuestra franquicia. Nos complace poder acompañarte en este proceso.\n\nSaludos cordiales,\nEquipo de Franquicias`
        }));
        break;
      case 'followup':
        setFormData(prev => ({
          ...prev,
          subject: 'Seguimiento de tu consulta',
          message: `Hola ${recipientName || 'estimado/a cliente'},\n\nQueremos hacer seguimiento a tu consulta sobre nuestra franquicia. ¿Tienes alguna pregunta adicional?\n\nQuedamos atentos a tu respuesta.\n\nSaludos cordiales,\nEquipo de Franquicias`
        }));
        break;
      case 'proposal':
        setFormData(prev => ({
          ...prev,
          subject: 'Propuesta de franquicia',
          message: `Hola ${recipientName || 'estimado/a cliente'},\n\nAdjuntamos la propuesta detallada de nuestra franquicia basada en tu perfil e intereses.\n\nEstaremos encantados de resolver cualquier duda.\n\nSaludos cordiales,\nEquipo de Franquicias`
        }));
        break;
      default:
        break;
    }
  };

  const handleSend = async () => {
    if (!formData.to || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Email enviado",
        description: `Email enviado correctamente a ${formData.to}`
      });
      
      // Reset form
      setFormData({
        to: recipientEmail,
        subject: '',
        message: '',
        template: 'custom'
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el email. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Enviar Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Enviar Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Plantilla</Label>
            <Select value={formData.template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar plantilla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Personalizado</SelectItem>
                <SelectItem value="welcome">Bienvenida</SelectItem>
                <SelectItem value="followup">Seguimiento</SelectItem>
                <SelectItem value="proposal">Propuesta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">Para</Label>
            <Input
              id="to"
              name="to"
              type="email"
              value={formData.to}
              onChange={handleInputChange}
              placeholder="email@ejemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Asunto del email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Escribe tu mensaje aquí..."
              rows={8}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? (
                <>
                  <Send className="mr-2 h-4 w-4 animate-pulse" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}