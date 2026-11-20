import { Request, Response } from 'express';
import { ServiceRepository } from '../repositories/service.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';
import { ServiceCategory } from '@vetcare/shared';

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
    // Requisito estrito: cadastro recebe exclusivamente nome, categoria, duracao_minutos (ou durationMinutes / duracaoMinutos)
    const nome = req.body.nome || req.body.name;
    const categoria = req.body.categoria || req.body.category;
    const duracaoRaw = req.body.duracao_minutos !== undefined ? req.body.duracao_minutos : (req.body.durationMinutes || req.body.duracaoMinutos);

    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({
        error: 'O campo nome (string) é obrigatório.',
      });
    }

    if (!categoria || typeof categoria !== 'string' || !categoria.trim()) {
      return res.status(400).json({
        error: 'O campo categoria (string) é obrigatório.',
      });
    }

    const duracaoMinutos = Number(duracaoRaw);
    if (duracaoRaw === undefined || !Number.isInteger(duracaoMinutos) || duracaoMinutos <= 0) {
      return res.status(400).json({
        error: 'O campo duracao_minutos deve ser um número inteiro positivo.',
      });
    }

    const created = this.serviceRepo.create({
      name: nome.trim(),
      category: categoria.trim() as ServiceCategory,
      durationMinutes: duracaoMinutos,
      price: req.body.price ? Number(req.body.price) : 0,
      colorHex: req.body.colorHex || '#0284c7',
      description: req.body.description,
      isActive: req.body.isActive !== false,
      requiredProfessional: req.body.requiredProfessional,
      requiredResource: req.body.requiredResource,
      instructions: req.body.instructions,
    });

    this.auditRepo.log({
      action: 'CREATE',
      targetId: created.id,
      targetType: 'SERVICE',
      user: 'Administração VetCare',
      details: `Novo serviço cadastrado: ${created.name} (${created.durationMinutes} min)`,
    });

    res.status(201).json(created);
  };

  update = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const existing = this.serviceRepo.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }

    const updates: any = { ...req.body };
    if (req.body.nome !== undefined) updates.name = req.body.nome;
    if (req.body.categoria !== undefined) updates.category = req.body.categoria;
    if (req.body.duracao_minutos !== undefined) {
      const d = Number(req.body.duracao_minutos);
      if (!Number.isInteger(d) || d <= 0) {
        return res.status(400).json({
          error: 'O campo duracao_minutos deve ser um número inteiro positivo.',
        });
      }
      updates.durationMinutes = d;
    }

    const updated = this.serviceRepo.update(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }

    this.auditRepo.log({
      action: 'UPDATE_STATUS',
      targetId: id,
      targetType: 'SERVICE',
      user: 'Administração VetCare',
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
      user: 'Administração VetCare',
      details: `Serviço ${service.name} removido do catálogo.`,
    });

    res.json({ message: 'Serviço removido com sucesso.', id });
  };
}
