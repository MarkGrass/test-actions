import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationDto {
    @IsOptional()
    @IsString()
    cursor?: string;

    @IsOptional()
    @Transform(({ value }: { value: string }) => parseInt(value))
    @IsNumber()
    @Min(10)
    @Max(100)
    limit?: number = 10;
}
