-- CreateTable
CREATE TABLE "budget_flows" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_flow_nodes" (
    "id" TEXT NOT NULL,
    "budget_flow_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_flow_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_flow_links" (
    "id" TEXT NOT NULL,
    "budget_flow_id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_flow_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "budget_flows_user_id_month_year_key" ON "budget_flows"("user_id", "month", "year");

-- AddForeignKey
ALTER TABLE "budget_flows" ADD CONSTRAINT "budget_flows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_flow_nodes" ADD CONSTRAINT "budget_flow_nodes_budget_flow_id_fkey" FOREIGN KEY ("budget_flow_id") REFERENCES "budget_flows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_flow_links" ADD CONSTRAINT "budget_flow_links_budget_flow_id_fkey" FOREIGN KEY ("budget_flow_id") REFERENCES "budget_flows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_flow_links" ADD CONSTRAINT "budget_flow_links_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "budget_flow_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_flow_links" ADD CONSTRAINT "budget_flow_links_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "budget_flow_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
