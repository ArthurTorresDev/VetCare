import { Request, Response } from 'express';
import { ClientRepository } from '../repositories/client.repository.js';
import { PetRepository } from '../repositories/pet.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';

export class ClientController {
  private clientRepo: ClientRepository;
  private petRepo: PetRepository;
  private auditRepo: AuditRepository;

  constructor(
    clientRepo = new ClientRepository(),
    petRepo = new PetRepository(),
    auditRepo = new AuditRepository(),
  ) {
    this.clientRepo = clientRepo;
    this.petRepo = petRepo;
    this.auditRepo = auditRepo;
  }

  list = (req: Request, res: Response) => {
    const { search } = req.query;
    const clientes = search
      ? this.clientRepo.search(String(search))
      : this.clientRepo.findAll();

    const pets = this.petRepo.findAll();
    const clientesWithPets = clientes.map((c) => ({
      ...c,
      pets: pets.filter((p) => p.clientId === c.id),
    }));

    res.json(clientesWithPets);
  };

  getById = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const client = this.clientRepo.findById(id);
    if (!client) {
      return res.status(404).json({ error: 'Cliente tutor não encontrado.' });
    }
    const pets = this.petRepo.findByClientId(id);
    res.json({ ...client, pets });
  };

  create = (req: Request, res: Response) => {
    const { name, phone, email, cpf } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });
    }

    const created = this.clientRepo.create({ name, phone, email, cpf });

    this.auditRepo.log({
      action: 'CREATE',
      targetId: created.id,
      targetType: 'CLIENT',
      user: 'Recepção (VetCare)',
      details: `Novo tutor cadastrado: ${created.name} (${created.phone})`,
    });

    res.status(201).json(created);
  };

  update = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const updated = this.clientRepo.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Cliente tutor não encontrado.' });
    }

    this.auditRepo.log({
      action: 'UPDATE_STATUS',
      targetId: id,
      targetType: 'CLIENT',
      user: 'Recepção (VetCare)',
      details: `Dados do tutor ${updated.name} atualizados.`,
    });

    res.json(updated);
  };

  delete = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const client = this.clientRepo.findById(id);
    if (!client) {
      return res.status(404).json({ error: 'Cliente tutor não encontrado.' });
    }

    this.clientRepo.delete(id);
    this.auditRepo.log({
      action: 'CANCEL',
      targetId: id,
      targetType: 'CLIENT',
      user: 'Recepção (VetCare)',
      details: `Tutor ${client.name} excluído do sistema.`,
    });

    res.json({ message: 'Tutor removido com sucesso.', id });
  };

  getPets = (req: Request, res: Response) => {
    const clientId = String(req.params.id);
    const pets = this.petRepo.findByClientId(clientId);
    res.json(pets);
  };

  addPet = (req: Request, res: Response) => {
    const clientId = String(req.params.id);
    const client = this.clientRepo.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Cliente tutor não encontrado.' });
    }

    const { name, species, breed, sex, birthDate, weightKg, notes } = req.body;
    if (!name || !species) {
      return res.status(400).json({ error: 'Nome e espécie são obrigatórios.' });
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
      user: 'Recepção (VetCare)',
      details: `Novo animal cadastrado: ${created.name} (${created.species} - ${created.breed}) para o tutor ${client.name}`,
    });

    res.status(201).json(created);
  };
}
