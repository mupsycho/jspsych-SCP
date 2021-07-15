setwd(".")
library(tidyverse)

rm(list = ls())
file <- list.files("../")
file <- file[grep("sv02", file, fixed = TRUE)]
for (f in file) {
    tmp2Data <- read.csv(paste("../", f, sep=""), header=TRUE, sep=",", stringsAsFactors = F, encoding = "UTF-8")
    print(f)
    if (exists("df.M")) {
        df.M <- rbind(df.M, tmp2Data)
    } else {
        df.M <- tmp2Data
    }
}
df.M <- subset(df.M, select = -c(Name, PhoneNumber))
rm(list = ls()[-grep("df", ls())])
write.csv(df.M, file = "sv02_total.csv", row.names = F)
