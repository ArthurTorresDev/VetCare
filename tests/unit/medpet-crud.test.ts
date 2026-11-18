import { describe, it, expect, beforeEach } from 'vitest';
import { VeterinarioRepository } from '../../backend/src/repositories/veterinario.repository.js';
import { AtendenteRepository } from '../../backend/src/repositories/atendente.repository.js';
import { AtendimentoRepository } from '../../backend/src/repositories/atendimento.repository.js';
import { InMemoryStore } from '../../backend/src/models/in-memory.store.js';

describe('CRUD das Entidades medpet.sql (Veterinários, Atendentes e Atendimentos)', () => {
  let vetRepo: VeterinarioRepository;
  let atendenteRepo: AtendenteRepository;
  let atendimentoRepo: AtendimentoRepository;

  beforeEach(() => {
    InMemoryStore.getInstance().reset();
    vetRepo = new VeterinarioRepository();
    atendenteRepo = new AtendenteRepository();
    atendimentoRepo = new AtendimentoRepository();
  });

  describe('Veterinários (CRMV & Dados Cadastrais)', () => {
    it('deve listar veterinários existentes na carga inicial', async () => {
      const list = await vetRepo.findAll();
      expect(list.length).toBeGreaterThanOrEqual(2);
      expect(list[0].nome).toBeDefined();
      expect(list[0].crmv).toBeDefined();
    });

    it('deve cadastrar um novo médico veterinário', async () => {
      const created = await vetRepo.create({
        nome: 'Dr. Lucas Prado',
        crmv: 'SP-99887',
        telefone: '(11) 98888-7777',
        email: 'lucas.prado@medpet.com',
      });

      expect(created.id).toBeDefined();
      expect(created.nome).toBe('Dr. Lucas Prado');
      expect(created.crmv).toBe('SP-99887');

      const found = await vetRepo.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.email).toBe('lucas.prado@medpet.com');
    });

    it('deve atualizar dados do veterinário', async () => {
      const list = await vetRepo.findAll();
      const target = list[0];

      const updated = await vetRepo.update(target.id, {
        telefone: '(11) 91111-0000',
      });

      expect(updated?.telefone).toBe('(11) 91111-0000');
    });

    it('deve remover veterinário', async () => {
      const created = await vetRepo.create({
        nome: 'Dr. Temporário',
        crmv: 'SP-00000',
        email: 'temp.vet@medpet.com',
      });

      const deleted = await vetRepo.delete(created.id);
      expect(deleted).toBe(true);

      const search = await vetRepo.findById(created.id);
      expect(search).toBeNull();
    });
  });

  describe('Atendentes (Recepção MedPet)', () => {
    it('deve listar e cadastrar atendentes', async () => {
      const initial = await atendenteRepo.findAll();
      expect(initial.length).toBeGreaterThanOrEqual(2);

      const created = await atendenteRepo.create({
        nome: 'Juliana Paes',
        email: 'juliana.paes@medpet.com',
        telefone: '(11) 97777-6666',
      });

      expect(created.id).toBeDefined();
      expect(created.nome).toBe('Juliana Paes');

      const found = await atendenteRepo.findByEmail('juliana.paes@medpet.com');
      expect(found?.id).toBe(created.id);
    });

    it('deve atualizar e remover atendente', async () => {
      const created = await atendenteRepo.create({
        nome: 'Marcos Teste',
        email: 'marcos.teste@medpet.com',
      });

      const updated = await atendenteRepo.update(created.id, {
        telefone: '(11) 90000-0000',
      });
      expect(updated?.telefone).toBe('(11) 90000-0000');

      const deleted = await atendenteRepo.delete(created.id);
      expect(deleted).toBe(true);
    });
  });

  describe('Atendimentos Clínicos (Relacionamento Pet, Veterinario e Atendente)', () => {
    it('deve registrar e listar atendimentos', async () => {
      const list = await atendimentoRepo.findAll();
      expect(list.length).toBeGreaterThanOrEqual(1);

      const novo = await atendimentoRepo.create({
        petId: 'p2',
        veterinarioId: 'v1',
        atendenteId: 'a1',
        tipoServico: 'Exame de Sangue',
        dataHora: new Date().toISOString(),
        status: 'Agendado',
        observacoes: 'Jejum 8h',
      });

      expect(novo.id).toBeDefined();
      expect(novo.tipoServico).toBe('Exame de Sangue');

      const porPet = await atendimentoRepo.findByPetId('p2');
      expect(porPet.some((a) => a.id === novo.id)).toBe(true);
    });

    it('deve atualizar status e remover atendimento', async () => {
      const list = await atendimentoRepo.findAll();
      const target = list[0];

      const updated = await atendimentoRepo.update(target.id, {
        status: 'Concluído',
      });
      expect(updated?.status).toBe('Concluído');

      const deleted = await atendimentoRepo.delete(target.id);
      expect(deleted).toBe(true);
    });
  });
});
