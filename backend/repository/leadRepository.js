import BuilderLead from "../models/builderLeadModel.js";

class LeadRepository {
  async create(data) {
    return await BuilderLead.create(data);
  }

  async findById(id) {
    return await BuilderLead.findById(id).populate("templateId", "name slug");
  }

  async findAll(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 50) {
    const total = await BuilderLead.countDocuments(filter);
    const data = await BuilderLead.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("templateId", "name slug");
    return { data, total };
  }

  async updateStatus(id, status) {
    return await BuilderLead.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
  }

  async delete(id) {
    return await BuilderLead.findByIdAndDelete(id);
  }
}

export default new LeadRepository();
