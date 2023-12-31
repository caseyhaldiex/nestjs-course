import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreateReportDto } from './dtos/create-report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  createEstimate({ make, model, lng, lat, year, mileage }: GetEstimateDto) {
    return (
      this.repo
        .createQueryBuilder()
        //select average price
        .select('AVG(price)', 'price')
        // Select ALL
        // .select('*')
        //apply SQL filters
        // finds under all rows. make row equals value of search criteria
        // colon is for security concerns. Dont stick in raw string
        .where('make = :make', { make: make })
        .andWhere('model = :model', { model })
        .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
        .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
        .andWhere('year - :year BETWEEN -3 AND 3', { year })
        // .andWhere('approved IS TRUE')
        // //ABS = absolute value
        // .orderBy('ABS(mileage - :mileage)', 'DESC')
        // .setParameters({ mileage })
        //show only top 3
        // .limit(3)
        // .getRawMany()
        .getRawOne()
    );
  }
  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user;
    return this.repo.save(report);
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.repo.findOne({ where: { id: parseInt(id) } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    report.approved = approved;
    console.log(report);
    return this.repo.save(report);
  }
}
