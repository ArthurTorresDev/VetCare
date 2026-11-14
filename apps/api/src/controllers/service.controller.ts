import { Request, Response } from 'express';
import { ServiceRepository } from '../domain/repositories/service.repository.js';
import { AuditRepository } from '../domain/repositories/audit.repository.js';

export class ServiceController {
  private serviceRepo: ServiceRepository;
  private auditRepo: AuditRepository;

  constructor(serviceRepo = new ServiceRepository(), auditRepo = new AuditRepository()) {
    this.serviceRepo = serviceRepo;
    this.auditRepo = auditRepo;
  }

  list = (req: Request, res: Response) => {
    const onlyActive = req.query.active === 'true';
    res.json(this.serviceRepo.findAll(onlyActive));
  };

  getById = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const service = this.serviceRepo.findById(id);
    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }
    res.json(service);
  };

  create = (req: Request, res: Response) => {
    const {
      name,
      category,
      durationMinutes,
      price,
      colorHex,
      description,
      isActive,
      requiredProfessional,
      requiredResource,
      instructions,
    } = req.body;

    if (!name || !category || !durationMinutes) {
      return res.status(400).json({
        error: 'Nome, categoria e duração padrão são obrigatórios para o serviço.',
      });
    }

    const created = this.serviceRepo.create({
      name,
      category,
      durationMinutes: Number(durationMinutes),
      price: price ? Number(price) : 0,
      colorHex: colorHex || '#0284c7',
      description,
      isActive: isActive !== false,
      requiredProfessional,
      requiredResource,
      instructions,
    });

    this.auditRepo.log({
      action: 'CREATE',
      targetId: created.id,
      targetType: 'SERVICE',
      user: 'Administração MedPet',
      details: `Novo serviço cadastrado: ${created.name} (${created.durationMinutes} min)`,
    });

    res.status(201).json(created);
  };

  update = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const updated = this.serviceRepo.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }

    this.auditRepo.log({
      action: 'UPDATE_STATUS',
      targetId: id,
      targetType: 'SERVICE',
      user: 'Administração MedPet',
      details: `Serviço clínico atualizado: ${updated.name}`,
    });

    res.json(updated);
  };

  delete = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const service = this.serviceRepo.findById(id);
    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }

    this.serviceRepo.delete(id);
    this.auditRepo.log({
      action: 'CANCEL',
      targetId: id,
      targetType: 'SERVICE',
      user: 'Administração MedPet',
      details: `Serviço ${service.name} removido do catálogo.`,
    });

    res.json({ message: 'Serviço removido com sucesso.', id });
  };
}
