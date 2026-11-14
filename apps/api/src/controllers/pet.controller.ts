import { Request, Response } from 'express';
import { PetRepository } from '../domain/repositories/pet.repository.js';
import { ClientRepository } from '../domain/repositories/client.repository.js';
import { AuditRepository } from '../domain/repositories/audit.repository.js';

export class PetController {
  private petRepo: PetRepository;
  private clientRepo: ClientRepository;
  private auditRepo: AuditRepository;

  constructor(
    petRepo = new PetRepository(),
    clientRepo = new ClientRepository(),
    auditRepo = new AuditRepository(),
  ) {
    this.petRepo = petRepo;
    this.clientRepo = clientRepo;
    this.auditRepo = auditRepo;
  }

  list = (req: Request, res: Response) => {
    const { clientId, species } = req.query;
    let pets = this.petRepo.findAll();
    if (clientId && typeof clientId === 'string') {
      pets = pets.filter((p) => p.clientId === clientId);
    }
    if (species && typeof species === 'string') {
      pets = pets.filter((p) => p.species.toLowerCase() === species.toLowerCase());
    }
    res.json(pets);
  };

  getById = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const pet = this.petRepo.findById(id);
    if (!pet) {
      return res.status(404).json({ error: 'Animal paciente não encontrado.' });
    }
    res.json(pet);
  };

  create = (req: Request, res: Response) => {
    const { clientId, name, species, breed, sex, birthDate, weightKg, notes } = req.body;
    if (!clientId || !name || !species) {
      return res.status(400).json({ error: 'clientId, name e species são obrigatórios.' });
    }

    const client = this.clientRepo.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Cliente tutor não encontrado.' });
    }

    const created = this.petRepo.create({
      clientId,
      name,
      species,
      breed: breed || 'SRD (Sem Raça Definida)',
      sex,
      birthDate,
      weightKg: weightKg ? Number(weightKg) : undefined,
      notes,
    });

    this.auditRepo.log({
      action: 'CREATE',
      targetId: created.id,
      targetType: 'PET',
      user: 'Recepção (MedPet)',
      details: `Novo pet cadastrado: ${created.name} (${created.species}) para ${client.name}`,
    });

    res.status(201).json(created);
  };

  update = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const updated = this.petRepo.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Animal paciente não encontrado.' });
    }

    this.auditRepo.log({
      action: 'UPDATE_STATUS',
      targetId: id,
      targetType: 'PET',
      user: 'Recepção (MedPet)',
      details: `Dados do pet ${updated.name} atualizados.`,
    });

    res.json(updated);
  };

  delete = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const pet = this.petRepo.findById(id);
    if (!pet) {
      return res.status(404).json({ error: 'Animal paciente não encontrado.' });
    }

    this.petRepo.delete(id);
    this.auditRepo.log({
      action: 'CANCEL',
      targetId: id,
      targetType: 'PET',
      user: 'Recepção (MedPet)',
      details: `Pet ${pet.name} excluído do sistema.`,
    });

    res.json({ message: 'Animal removido com sucesso.', id });
  };
}
